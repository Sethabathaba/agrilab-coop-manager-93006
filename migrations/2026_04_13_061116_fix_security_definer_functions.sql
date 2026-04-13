-- Migration file to fix security definer functions by adding search_path protection.

CREATE OR REPLACE FUNCTION get_current_user_role() RETURNS text AS $$
BEGIN
    RETURN current_setting('role');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION has_role(role text) RETURNS boolean AS $$
DECLARE
    current_role text;
BEGIN
    current_role := get_current_user_role();
    RETURN current_role = role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION has_any_role(roles text[]) RETURNS boolean AS $$
DECLARE
    current_role text;
BEGIN
    current_role := get_current_user_role();
    RETURN current_role = ANY(roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION handle_new_user(user_id int) RETURNS void AS $$
BEGIN
    -- Logic to handle new user
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;