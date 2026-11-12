CREATE TABLE `listing_photos` (
	`listing_id` text PRIMARY KEY NOT NULL,
	`mime` text NOT NULL,
	`data` text NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`condition` text NOT NULL,
	`photo` text,
	`daily_price` integer NOT NULL,
	`bond` integer NOT NULL,
	`area` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `listings_owner_idx` ON `listings` (`owner_id`);--> statement-breakpoint
CREATE INDEX `listings_status_idx` ON `listings` (`status`,`category`);--> statement-breakpoint
CREATE TABLE `peer_rentals` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`renter_id` text NOT NULL,
	`days` integer NOT NULL,
	`daily_price` integer NOT NULL,
	`bond` integer NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`handover_code` text NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`bond_status` text DEFAULT 'none' NOT NULL,
	`bond_withheld` integer DEFAULT 0 NOT NULL,
	`claim_note` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`approved_at` integer,
	`started_at` integer,
	`due_at` integer,
	`returned_at` integer,
	`closed_at` integer,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`renter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `peer_rentals_renter_idx` ON `peer_rentals` (`renter_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `peer_rentals_owner_idx` ON `peer_rentals` (`owner_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `peer_rentals_listing_idx` ON `peer_rentals` (`listing_id`,`status`);--> statement-breakpoint
ALTER TABLE `users` ADD `is_seed` integer DEFAULT false NOT NULL;