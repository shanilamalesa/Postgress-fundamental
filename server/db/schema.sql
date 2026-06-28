--
-- PostgreSQL database dump
--

\restrict UcmhXVnBfrrzBpFNdfmDKxok9UG5lfKcaQldOCTUPjBJUtSxFXnZbhuL5aT5hoW

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_id uuid NOT NULL,
    state text DEFAULT 'awaiting_name'::text NOT NULL,
    last_message_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.conversations OWNER TO crm_user;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wa_phone text NOT NULL,
    name text,
    email text,
    inquiry_type text,
    status text DEFAULT 'new'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    assigned_to uuid,
    channel text DEFAULT 'whatsapp'::text NOT NULL,
    category text,
    CONSTRAINT leads_channel_check CHECK ((channel = ANY (ARRAY['whatsapp'::text, 'ussd'::text, 'web'::text]))),
    CONSTRAINT leads_status_check CHECK ((status = ANY (ARRAY['new'::text, 'contacted'::text, 'qualified'::text, 'converted'::text, 'lost'::text])))
);


ALTER TABLE public.leads OWNER TO crm_user;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    lead_id uuid NOT NULL,
    direction text NOT NULL,
    body text,
    raw_payload jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    order_id uuid,
    meta_message_id text,
    CONSTRAINT messages_direction_check CHECK ((direction = ANY (ARRAY['in'::text, 'out'::text])))
);


ALTER TABLE public.messages OWNER TO crm_user;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO crm_user;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    price_cents_at_purchase integer NOT NULL,
    CONSTRAINT order_items_price_cents_at_purchase_check CHECK ((price_cents_at_purchase >= 0)),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    delivery_address text NOT NULL,
    subtotal_cents integer NOT NULL,
    payment_method text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    mpesa_checkout_request_id text,
    mpesa_receipt_number text,
    payment_status text DEFAULT 'not_initiated'::text NOT NULL,
    CONSTRAINT orders_payment_method_check CHECK ((payment_method = ANY (ARRAY['mpesa'::text, 'airtel'::text, 'cod'::text]))),
    CONSTRAINT orders_payment_status_check CHECK ((payment_status = ANY (ARRAY['not_initiated'::text, 'initiated'::text, 'success'::text, 'failed'::text, 'cancelled'::text]))),
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text]))),
    CONSTRAINT orders_subtotal_cents_check CHECK ((subtotal_cents >= 0))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_id uuid NOT NULL,
    phone_number text NOT NULL,
    amount numeric(10,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    mpesa_receipt text,
    transaction_date text,
    raw_callback jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    price_cents integer NOT NULL,
    image_url text,
    stock integer DEFAULT 0 NOT NULL,
    category text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT products_price_cents_check CHECK ((price_cents >= 0)),
    CONSTRAINT products_stock_check CHECK ((stock >= 0))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    role text DEFAULT 'agent'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'agent'::text])))
);


ALTER TABLE public.users OWNER TO crm_user;

--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: leads leads_wa_phone_key; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_wa_phone_key UNIQUE (wa_phone);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_leads_assigned_to; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE INDEX idx_leads_assigned_to ON public.leads USING btree (assigned_to);


--
-- Name: idx_leads_channel; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE INDEX idx_leads_channel ON public.leads USING btree (channel);


--
-- Name: idx_leads_created_at; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE INDEX idx_leads_created_at ON public.leads USING btree (created_at DESC);


--
-- Name: idx_leads_status; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE INDEX idx_leads_status ON public.leads USING btree (status);


--
-- Name: idx_messages_lead_id; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE INDEX idx_messages_lead_id ON public.messages USING btree (lead_id);


--
-- Name: idx_messages_order_id; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE INDEX idx_messages_order_id ON public.messages USING btree (order_id);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_orders_checkout_request; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_checkout_request ON public.orders USING btree (mpesa_checkout_request_id);


--
-- Name: idx_orders_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_phone ON public.orders USING btree (customer_phone);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_category ON public.products USING btree (category);


--
-- Name: idx_products_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_slug ON public.products USING btree (slug);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: conversations conversations_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: leads leads_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: messages messages_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: messages messages_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: payments payments_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: TABLE order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_items TO crm_user;


--
-- Name: SEQUENCE order_items_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.order_items_id_seq TO crm_user;


--
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO crm_user;


--
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payments TO crm_app;
GRANT ALL ON TABLE public.payments TO crm_user;


--
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO crm_user;


--
-- PostgreSQL database dump complete
--

\unrestrict UcmhXVnBfrrzBpFNdfmDKxok9UG5lfKcaQldOCTUPjBJUtSxFXnZbhuL5aT5hoW

