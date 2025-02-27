/*
  # Mind Map Database Schema

  1. New Tables
    - `mindmaps`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `nodes`
      - `id` (uuid, primary key)
      - `mindmap_id` (uuid, references mindmaps)
      - `label` (text)
      - `created_at` (timestamp)
    
    - `edges`
      - `id` (uuid, primary key)
      - `mindmap_id` (uuid, references mindmaps)
      - `source_id` (uuid, references nodes)
      - `target_id` (uuid, references nodes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own mind maps
      - Create new mind maps
      - Update their own mind maps
      - Delete their own mind maps
*/

-- Create mindmaps table
CREATE TABLE IF NOT EXISTS mindmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create nodes table
CREATE TABLE IF NOT EXISTS nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mindmap_id uuid REFERENCES mindmaps ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create edges table
CREATE TABLE IF NOT EXISTS edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mindmap_id uuid REFERENCES mindmaps ON DELETE CASCADE NOT NULL,
  source_id uuid REFERENCES nodes ON DELETE CASCADE NOT NULL,
  target_id uuid REFERENCES nodes ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE mindmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

-- Policies for mindmaps
CREATE POLICY "Users can view their own mindmaps"
  ON mindmaps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create mindmaps"
  ON mindmaps
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mindmaps"
  ON mindmaps
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mindmaps"
  ON mindmaps
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for nodes
CREATE POLICY "Users can view nodes of their mindmaps"
  ON nodes
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM mindmaps
    WHERE mindmaps.id = nodes.mindmap_id
    AND mindmaps.user_id = auth.uid()
  ));

CREATE POLICY "Users can create nodes in their mindmaps"
  ON nodes
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM mindmaps
    WHERE mindmaps.id = mindmap_id
    AND mindmaps.user_id = auth.uid()
  ));

-- Policies for edges
CREATE POLICY "Users can view edges of their mindmaps"
  ON edges
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM mindmaps
    WHERE mindmaps.id = edges.mindmap_id
    AND mindmaps.user_id = auth.uid()
  ));

CREATE POLICY "Users can create edges in their mindmaps"
  ON edges
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM mindmaps
    WHERE mindmaps.id = mindmap_id
    AND mindmaps.user_id = auth.uid()
  ));