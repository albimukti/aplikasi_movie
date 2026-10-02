package migrations

import _ "embed"

// InitSQL contains the full schema and seed data
//
//go:embed 001_init.sql
var InitSQL string
