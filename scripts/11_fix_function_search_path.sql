-- Fix Supabase lint: function_search_path_mutable (0011)
-- For SECURITY DEFINER functions, pin search_path to avoid role-dependent lookup

ALTER FUNCTION public.add_user_xp(uuid, integer)
  SET search_path = public;

ALTER FUNCTION public.get_user_rank(uuid)
  SET search_path = public;

ALTER FUNCTION public.get_featured_contributors()
  SET search_path = public;

ALTER FUNCTION public.get_recent_activity_feed(integer)
  SET search_path = public;

ALTER FUNCTION public.get_user_registration_trend()
  SET search_path = public;

ALTER FUNCTION public.get_content_upload_trend()
  SET search_path = public;

ALTER FUNCTION public.get_activity_trend()
  SET search_path = public;

ALTER FUNCTION public.get_most_viewed_content()
  SET search_path = public;

ALTER FUNCTION public.get_most_active_users()
  SET search_path = public;

ALTER FUNCTION public.get_subject_distribution()
  SET search_path = public;

ALTER FUNCTION public.set_new_user_defaults()
  SET search_path = public;

ALTER FUNCTION public.update_user_activity()
  SET search_path = public;

ALTER FUNCTION public.check_and_award_badges(uuid)
  SET search_path = public;
