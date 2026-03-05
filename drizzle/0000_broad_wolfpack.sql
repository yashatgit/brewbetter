CREATE TABLE `beans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`roaster` text NOT NULL,
	`origin_country` text NOT NULL,
	`origin_region` text,
	`variety` text,
	`processing_method` text NOT NULL,
	`roast_level` text NOT NULL,
	`roast_date` text NOT NULL,
	`altitude_masl` integer,
	`bag_weight_g` integer,
	`bag_photo_url` text,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `brew_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`brewed_at` text NOT NULL,
	`time_of_day` text NOT NULL,
	`bean_id` text NOT NULL,
	`days_off_roast` integer NOT NULL,
	`grinder_id` text NOT NULL,
	`grinder_setting` text NOT NULL,
	`brew_device_id` text NOT NULL,
	`filter_id` text,
	`water_type_id` text NOT NULL,
	`brew_method_id` text NOT NULL,
	`water_temp` integer NOT NULL,
	`coffee_dose` real NOT NULL,
	`total_water` real NOT NULL,
	`ratio` real NOT NULL,
	`bloom_water` real,
	`bloom_time` integer,
	`num_pours` integer,
	`total_brew_time` integer NOT NULL,
	`technique_notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`bean_id`) REFERENCES `beans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`grinder_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`brew_device_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`filter_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`water_type_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`brew_method_id`) REFERENCES `brew_methods`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `brew_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`brew_device_type` text NOT NULL,
	`parameter_schema` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `equipment` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`brand` text,
	`model` text,
	`grind_unit_label` text,
	`is_default` integer DEFAULT false NOT NULL,
	`last_used_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `saved_setups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`grinder_id` text NOT NULL,
	`default_grind_setting` text,
	`brew_device_id` text NOT NULL,
	`filter_id` text,
	`water_type_id` text,
	`brew_method_id` text NOT NULL,
	`default_coffee_dose` real,
	`default_total_water` real,
	`default_water_temp` integer,
	`is_default` integer DEFAULT false NOT NULL,
	`last_used_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`grinder_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`brew_device_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`filter_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`water_type_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`brew_method_id`) REFERENCES `brew_methods`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tasting_evaluations` (
	`id` text PRIMARY KEY NOT NULL,
	`brew_log_id` text NOT NULL,
	`acidity_feel` integer NOT NULL,
	`sweet_bitter` integer NOT NULL,
	`body` text NOT NULL,
	`aftertaste_presence` integer NOT NULL,
	`aftertaste_pleasant` text,
	`flavor_notes` text,
	`overall_enjoyment` integer NOT NULL,
	`personal_notes` text,
	`mindfulness` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`brew_log_id`) REFERENCES `brew_logs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tasting_evaluations_brew_log_id_unique` ON `tasting_evaluations` (`brew_log_id`);