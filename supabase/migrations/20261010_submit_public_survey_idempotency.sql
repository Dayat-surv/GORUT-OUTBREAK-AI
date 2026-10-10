-- GORUT-OUTBREAK-AI: idempotent public survey submissions
-- Apply in Supabase SQL Editor after reviewing this migration.
-- Existing rows remain valid; submission_id is nullable for historical responses.

ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS submission_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS survey_responses_survey_submission_uidx
  ON public.survey_responses (survey_id, submission_id)
  WHERE submission_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.submit_public_survey(
  p_token text,
  p_payload jsonb,
  p_respondent_device text,
  p_submission_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_survey record;
  v_response_id uuid;
  v_existing_id uuid;
  v_case_id text;
  v_full_name text;
  v_age_raw text;
  v_age integer;
  v_sex text;
  v_onset_raw text;
  v_onset date;
  v_status text;
  v_outcome text;
  v_lat_raw text;
  v_lon_raw text;
  v_lat double precision;
  v_lon double precision;
BEGIN
  IF p_token IS NULL OR length(p_token) < 20 OR length(p_token) > 200 THEN
    RAISE EXCEPTION 'Token survei tidak valid';
  END IF;

  IF p_submission_id IS NULL THEN
    RAISE EXCEPTION 'ID pengiriman wajib diisi';
  END IF;

  IF p_payload IS NULL
     OR jsonb_typeof(p_payload) IS DISTINCT FROM 'object'
     OR pg_column_size(p_payload) > 100000 THEN
    RAISE EXCEPTION 'Format jawaban tidak valid atau terlalu besar';
  END IF;

  SELECT
    s.id AS survey_id,
    s.investigation_id,
    q.schema_json,
    i.owner_id
  INTO v_survey
  FROM public.public_surveys s
  JOIN public.questionnaires q ON q.id = s.questionnaire_id
  JOIN public.investigations i ON i.id = s.investigation_id
  WHERE s.public_token = p_token
    AND s.is_active = true
    AND (s.expires_at IS NULL OR s.expires_at > now())
    AND q.status = 'published';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Survei tidak valid atau investigasi tidak ditemukan';
  END IF;

  -- Serialize identical submissions so concurrent retries cannot create duplicates.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_survey.survey_id::text || ':' || p_submission_id::text, 0)
  );

  SELECT sr.id
    INTO v_existing_id
  FROM public.survey_responses sr
  WHERE sr.survey_id = v_survey.survey_id
    AND sr.submission_id = p_submission_id
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'duplicate', true,
      'response_id', v_existing_id,
      'case_id', v_existing_id::text
    );
  END IF;

  IF jsonb_typeof(v_survey.schema_json -> 'questions') IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Struktur pertanyaan instrumen tidak valid';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_object_keys(p_payload) AS input_key(key)
    WHERE NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(v_survey.schema_json -> 'questions') AS question(item)
      WHERE question.item ->> 'id' = input_key.key
    )
  ) THEN
    RAISE EXCEPTION 'Jawaban memuat ID pertanyaan yang tidak terdaftar';
  END IF;

  SELECT nullif(trim(p_payload ->> (q.item ->> 'id')), '')
    INTO v_full_name
  FROM jsonb_array_elements(v_survey.schema_json -> 'questions') AS q(item)
  WHERE lower(trim(coalesce(q.item ->> 'label', ''))) IN ('nama lengkap', 'nama')
  ORDER BY CASE WHEN lower(trim(q.item ->> 'label')) = 'nama lengkap' THEN 0 ELSE 1 END
  LIMIT 1;

  SELECT nullif(trim(p_payload ->> (q.item ->> 'id')), '')
    INTO v_age_raw
  FROM jsonb_array_elements(v_survey.schema_json -> 'questions') AS q(item)
  WHERE lower(trim(coalesce(q.item ->> 'label', ''))) IN ('umur', 'usia')
  LIMIT 1;

  IF coalesce(v_age_raw, '') <> '' THEN
    IF v_age_raw !~ '^[0-9]{1,3}$' THEN
      RAISE EXCEPTION 'Umur harus berupa bilangan bulat 0 sampai 130';
    END IF;
    v_age := v_age_raw::integer;
    IF v_age < 0 OR v_age > 130 THEN
      RAISE EXCEPTION 'Umur di luar rentang yang diperbolehkan';
    END IF;
  END IF;

  SELECT nullif(trim(p_payload ->> (q.item ->> 'id')), '')
    INTO v_sex
  FROM jsonb_array_elements(v_survey.schema_json -> 'questions') AS q(item)
  WHERE lower(trim(coalesce(q.item ->> 'label', ''))) = 'jenis kelamin'
  LIMIT 1;

  SELECT nullif(trim(p_payload ->> (q.item ->> 'id')), '')
    INTO v_onset_raw
  FROM jsonb_array_elements(v_survey.schema_json -> 'questions') AS q(item)
  WHERE lower(trim(coalesce(q.item ->> 'label', ''))) LIKE '%tanggal onset%'
     OR lower(trim(coalesce(q.item ->> 'label', ''))) = 'onset'
  ORDER BY CASE WHEN lower(trim(q.item ->> 'label')) = 'tanggal onset' THEN 0 ELSE 1 END
  LIMIT 1;

  IF coalesce(v_onset_raw, '') <> '' THEN
    IF v_onset_raw !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
      RAISE EXCEPTION 'Tanggal onset harus berformat YYYY-MM-DD';
    END IF;
    BEGIN
      v_onset := v_onset_raw::date;
    EXCEPTION WHEN datetime_field_overflow OR invalid_datetime_format THEN
      RAISE EXCEPTION 'Tanggal onset tidak valid';
    END;
  END IF;

  SELECT nullif(trim(p_payload ->> (q.item ->> 'id')), '')
    INTO v_status
  FROM jsonb_array_elements(v_survey.schema_json -> 'questions') AS q(item)
  WHERE lower(trim(coalesce(q.item ->> 'label', ''))) = 'status kasus'
  LIMIT 1;

  SELECT nullif(trim(p_payload ->> (q.item ->> 'id')), '')
    INTO v_outcome
  FROM jsonb_array_elements(v_survey.schema_json -> 'questions') AS q(item)
  WHERE lower(trim(coalesce(q.item ->> 'label', ''))) IN ('outcome', 'keadaan akhir', 'status kesehatan')
  LIMIT 1;

  SELECT nullif(trim(p_payload ->> (q.item ->> 'id')), '')
    INTO v_lat_raw
  FROM jsonb_array_elements(v_survey.schema_json -> 'questions') AS q(item)
  WHERE lower(trim(coalesce(q.item ->> 'label', ''))) = 'latitude'
  LIMIT 1;

  IF coalesce(v_lat_raw, '') <> '' THEN
    IF v_lat_raw !~ '^-?[0-9]+(\.[0-9]+)?$' THEN
      RAISE EXCEPTION 'Latitude harus berupa angka';
    END IF;
    v_lat := v_lat_raw::double precision;
    IF v_lat < -90 OR v_lat > 90 THEN
      RAISE EXCEPTION 'Latitude tidak valid';
    END IF;
  END IF;

  SELECT nullif(trim(p_payload ->> (q.item ->> 'id')), '')
    INTO v_lon_raw
  FROM jsonb_array_elements(v_survey.schema_json -> 'questions') AS q(item)
  WHERE lower(trim(coalesce(q.item ->> 'label', ''))) = 'longitude'
  LIMIT 1;

  IF coalesce(v_lon_raw, '') <> '' THEN
    IF v_lon_raw !~ '^-?[0-9]+(\.[0-9]+)?$' THEN
      RAISE EXCEPTION 'Longitude harus berupa angka';
    END IF;
    v_lon := v_lon_raw::double precision;
    IF v_lon < -180 OR v_lon > 180 THEN
      RAISE EXCEPTION 'Longitude tidak valid';
    END IF;
  END IF;

  INSERT INTO public.survey_responses (
    survey_id, submission_id, respondent_device, payload
  )
  VALUES (
    v_survey.survey_id,
    p_submission_id,
    left(coalesce(p_respondent_device, ''), 180),
    p_payload
  )
  RETURNING id INTO v_response_id;

  v_case_id := v_response_id::text;

  INSERT INTO public.cases (
    id, owner_id, investigation_id, case_code, full_name, age, sex,
    onset_date, status, outcome, latitude, longitude, questionnaire_response
  )
  VALUES (
    v_case_id,
    v_survey.owner_id,
    v_survey.investigation_id,
    'PUB-' || upper(substr(v_response_id::text, 1, 12)),
    v_full_name,
    v_age,
    v_sex,
    v_onset,
    coalesce(v_status, 'Suspek'),
    v_outcome,
    v_lat,
    v_lon,
    p_payload
  );

  RETURN jsonb_build_object(
    'success', true,
    'duplicate', false,
    'response_id', v_response_id,
    'case_id', v_case_id
  );
END;
$function$;

-- Remove the old public entry point so callers cannot bypass idempotency.
REVOKE ALL ON FUNCTION public.submit_public_survey(text, jsonb, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.submit_public_survey(text, jsonb, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_public_survey(text, jsonb, text, uuid) TO anon, authenticated;
