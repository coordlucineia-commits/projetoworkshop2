-- Check-in automático ao registrar login no app (useAutoCheckin).
ALTER TYPE public.metodo_checkin ADD VALUE IF NOT EXISTS 'LOGIN';
