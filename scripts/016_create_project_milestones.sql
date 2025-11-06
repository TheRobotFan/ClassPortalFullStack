-- Create project milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON project_milestones(project_id);

-- Create function to update project progress when milestones are completed
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate progress as percentage of completed milestones
  UPDATE projects 
  SET progress_percentage = (
    CASE 
      WHEN (SELECT COUNT(*) FROM project_milestones WHERE project_id = NEW.project_id) = 0 THEN 0
      ELSE ROUND(
        (SELECT COUNT(*) FROM project_milestones 
         WHERE project_id = NEW.project_id AND completed = TRUE) * 100.0 / 
        (SELECT COUNT(*) FROM project_milestones WHERE project_id = NEW.project_id)
      )
    END
  )
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic progress updates
DROP TRIGGER IF EXISTS milestone_progress_update ON project_milestones;
CREATE TRIGGER milestone_progress_update
  AFTER INSERT OR UPDATE OR DELETE ON project_milestones
  FOR EACH ROW EXECUTE FUNCTION update_project_progress();

-- Insert some sample milestones for existing projects (optional)
-- This will only run if there are existing projects
DO $$
BEGIN
  -- Check if there are any projects without milestones
  IF EXISTS (SELECT 1 FROM projects LEFT JOIN project_milestones ON projects.id = project_milestones.project_id WHERE project_milestones.id IS NULL LIMIT 1) THEN
    -- Add sample milestones to projects that don't have any
    INSERT INTO project_milestones (project_id, title, description, due_date, completed)
    SELECT 
      p.id,
      'Milestone Iniziale',
      'Prima milestone del progetto',
      p.end_date - INTERVAL '30 days',
      FALSE
    FROM projects p
    LEFT JOIN project_milestones pm ON p.id = pm.project_id
    WHERE pm.id IS NULL
    LIMIT 5;
  END IF;
END $$;
