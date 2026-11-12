CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`shop_id` text NOT NULL,
	`assigned_shop_id` text,
	`category_id` text NOT NULL,
	`issue_type` text NOT NULL,
	`description` text NOT NULL,
	`address` text NOT NULL,
	`scheduled_at` integer,
	`budget` integer,
	`allow_negotiation` integer NOT NULL,
	`status` text DEFAULT 'broadcasting' NOT NULL,
	`price` integer,
	`eta_minutes` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`accepted_at` integer,
	`en_route_at` integer,
	`completed_at` integer,
	`closed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `bookings_user_idx` ON `bookings` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `group_offers` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`shop_name` text NOT NULL,
	`price_per_flat` integer NOT NULL,
	`min_flats` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `group_requests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `group_offers_request_idx` ON `group_offers` (`request_id`);--> statement-breakpoint
CREATE TABLE `group_participants` (
	`request_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`request_id`, `user_id`),
	FOREIGN KEY (`request_id`) REFERENCES `group_requests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `group_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`society_id` text NOT NULL,
	`created_by` text,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`preferred_date` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`selected_offer_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`society_id`) REFERENCES `societies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `group_requests_society_idx` ON `group_requests` (`society_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` text NOT NULL,
	`product_name` text NOT NULL,
	`category` text NOT NULL,
	`price` integer NOT NULL,
	`stock` integer NOT NULL,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `inventory_name_idx` ON `inventory` (`product_name`);--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `login_attempts_phone_idx` ON `login_attempts` (`phone`,`created_at`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`shop_id` text NOT NULL,
	`sender` text NOT NULL,
	`text` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `messages_thread_idx` ON `messages` (`user_id`,`shop_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `offers` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`shop_id` text NOT NULL,
	`price` integer NOT NULL,
	`eta_minutes` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`counter_price` integer,
	`countered_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `offers_booking_shop_idx` ON `offers` (`booking_id`,`shop_id`);--> statement-breakpoint
CREATE TABLE `rentals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tool_id` text NOT NULL,
	`shop_id` text NOT NULL,
	`days` integer NOT NULL,
	`daily_price` integer NOT NULL,
	`deposit` integer NOT NULL,
	`pickup_code` text NOT NULL,
	`status` text DEFAULT 'reserved' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`picked_up_at` integer,
	`due_at` integer,
	`returned_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `rentals_user_idx` ON `rentals` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `rentals_tool_idx` ON `rentals` (`tool_id`,`status`);--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`inventory_id` text NOT NULL,
	`shop_id` text NOT NULL,
	`product_name` text NOT NULL,
	`price` integer NOT NULL,
	`pickup_code` text NOT NULL,
	`status` text DEFAULT 'held' NOT NULL,
	`stock_released` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reservations_user_idx` ON `reservations` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` text NOT NULL,
	`booking_id` text,
	`author` text NOT NULL,
	`rating` integer NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_booking_id_unique` ON `reviews` (`booking_id`);--> statement-breakpoint
CREATE INDEX `reviews_shop_idx` ON `reviews` (`shop_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `shops` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category_id` text NOT NULL,
	`tier` text NOT NULL,
	`photo` text,
	`gallery` text DEFAULT '[]' NOT NULL,
	`bio` text NOT NULL,
	`hours` text NOT NULL,
	`area` text NOT NULL,
	`pincode` text NOT NULL,
	`phone` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`service_radius_km` integer NOT NULL,
	`visit_fee` integer NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`rating_count` integer DEFAULT 0 NOT NULL,
	`jobs_completed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `shops_category_idx` ON `shops` (`category_id`);--> statement-breakpoint
CREATE TABLE `societies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`pincode` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `society_members` (
	`user_id` text PRIMARY KEY NOT NULL,
	`society_id` text NOT NULL,
	`flat` text NOT NULL,
	`role` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`society_id`) REFERENCES `societies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `society_members_society_idx` ON `society_members` (`society_id`);--> statement-breakpoint
CREATE TABLE `tools` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` text NOT NULL,
	`name` text NOT NULL,
	`photo` text,
	`category` text NOT NULL,
	`condition` text NOT NULL,
	`daily_price` integer NOT NULL,
	`deposit` integer NOT NULL,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tools_shop_idx` ON `tools` (`shop_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`password_hash` text NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`pincode` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);