CREATE TABLE `bean_stats` (
	`bean_id` text PRIMARY KEY NOT NULL,
	`brew_count` integer DEFAULT 0 NOT NULL,
	`avg_enjoyment` real,
	`best_enjoyment` integer,
	`avg_ratio` real,
	`avg_dose` real,
	`avg_water_temp` real,
	`last_brewed_at` text,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`bean_id`) REFERENCES `beans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `preference_scores` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`value` text NOT NULL,
	`brew_count` integer DEFAULT 0 NOT NULL,
	`avg_enjoyment` real,
	`avg_acidity` real,
	`avg_sweet_bitter` real,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `brew_logs` ADD `brew_type_id` text;--> statement-breakpoint
ALTER TABLE `brew_logs` ADD `extra_params` text;