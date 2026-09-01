CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`access_token` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text NOT NULL,
	`postal_code` text NOT NULL,
	`address_line` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`status` text DEFAULT 'awaiting_quote' NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`shipping_cents` integer,
	`total_cents` integer,
	`shipping_days` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_orders_code` ON `orders` (`code`);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_orders_access_token` ON `orders` (`access_token`);
--> statement-breakpoint
CREATE INDEX `idx_orders_status_created` ON `orders` (`status`,`created_at`);
--> statement-breakpoint
CREATE INDEX `idx_orders_customer_email` ON `orders` (`customer_email`);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` text NOT NULL,
	`product_name` text NOT NULL,
	`size` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price_cents` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_order_items_order_id` ON `order_items` (`order_id`);
--> statement-breakpoint
CREATE TABLE `order_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_order_events_order_id_created` ON `order_events` (`order_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `email_outbox` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`event_key` text NOT NULL,
	`recipient` text NOT NULL,
	`subject` text NOT NULL,
	`template` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`sent_at` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_email_outbox_order_event` ON `email_outbox` (`order_id`,`event_key`);
--> statement-breakpoint
CREATE INDEX `idx_email_outbox_status_created` ON `email_outbox` (`status`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
