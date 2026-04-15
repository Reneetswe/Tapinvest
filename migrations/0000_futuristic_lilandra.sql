CREATE TABLE "brokers" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"commission" numeric(5, 2) DEFAULT '2.50',
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "holdings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" varchar NOT NULL,
	"stock_id" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"average_price" numeric(10, 3) NOT NULL,
	"total_cost" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"portfolio_id" varchar NOT NULL,
	"stock_id" varchar NOT NULL,
	"broker" varchar NOT NULL,
	"order_type" varchar NOT NULL,
	"order_style" varchar DEFAULT 'MARKET' NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 3),
	"executed_price" numeric(10, 3),
	"executed_quantity" integer DEFAULT 0,
	"status" varchar DEFAULT 'PENDING' NOT NULL,
	"total_cost" numeric(15, 2),
	"commission" numeric(8, 2) DEFAULT '2.50',
	"created_at" timestamp DEFAULT now(),
	"executed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar DEFAULT 'Default Portfolio' NOT NULL,
	"total_value" numeric(15, 2) DEFAULT '0',
	"total_cost" numeric(15, 2) DEFAULT '0',
	"cash_balance" numeric(15, 2) DEFAULT '10000',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stock_id" varchar NOT NULL,
	"price" numeric(10, 3) NOT NULL,
	"volume" integer DEFAULT 0,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stocks" (
	"id" varchar PRIMARY KEY NOT NULL,
	"symbol" varchar NOT NULL,
	"name" varchar NOT NULL,
	"sector" varchar,
	"current_price" numeric(10, 3) NOT NULL,
	"previous_close" numeric(10, 3),
	"market_cap" numeric(15, 2),
	"pe_ratio" numeric(8, 2),
	"dividend_yield" numeric(5, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "stocks_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");