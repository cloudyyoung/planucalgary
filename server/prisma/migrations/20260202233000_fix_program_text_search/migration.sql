-- Fix program search vector trigger function to match current columns
CREATE OR REPLACE FUNCTION catalog.update_program_text_search() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.code, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.long_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.display_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.degree_designation_code, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.degree_designation_name, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.general_info, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(NEW.admission_info, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(NEW.transcript_description, '')), 'D') ||
        setweight(to_tsvector('english', coalesce(NEW.notes, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
