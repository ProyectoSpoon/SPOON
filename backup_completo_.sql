--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:fNqGx0vBJidRrDeN+RrjXg==$I7XMEQY0ETRafCDj6tgGEETZeLuGPWKV2XPK/VpUt8s=:rAH9ToPLChHoB/P1hRPOcDN35TYPl4hKttrzwyEdCZo=';






--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18
-- Dumped by pg_dump version 14.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18
-- Dumped by pg_dump version 14.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

--
-- Database "spoon_db" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18
-- Dumped by pg_dump version 14.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: spoon_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE spoon_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';


ALTER DATABASE spoon_db OWNER TO postgres;

\connect spoon_db

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nombre character varying(255) NOT NULL,
    tipo character varying(20) NOT NULL,
    orden integer DEFAULT 0,
    descripcion text,
    restaurante_id character varying(50) NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT categorias_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['categoria'::character varying, 'subcategoria'::character varying])::text[])))
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- Name: combinacion_productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.combinacion_productos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    combinacion_id uuid NOT NULL,
    producto_id uuid NOT NULL,
    cantidad integer DEFAULT 1,
    precio_unitario numeric(10,2),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.combinacion_productos OWNER TO postgres;

--
-- Name: combinaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.combinaciones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    precio_total numeric(10,2) DEFAULT 0,
    es_favorito boolean DEFAULT false,
    es_especial boolean DEFAULT false,
    cantidad integer DEFAULT 1,
    restaurante_id character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.combinaciones OWNER TO postgres;

--
-- Name: menu_productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_productos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    menu_id uuid NOT NULL,
    producto_id uuid NOT NULL,
    precio_menu numeric(10,2),
    disponible boolean DEFAULT true,
    orden integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.menu_productos OWNER TO postgres;

--
-- Name: menus; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menus (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    fecha_inicio date,
    fecha_fin date,
    activo boolean DEFAULT true,
    restaurante_id character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.menus OWNER TO postgres;

--
-- Name: precio_historial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.precio_historial (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    producto_id uuid NOT NULL,
    precio_anterior numeric(10,2),
    precio_nuevo numeric(10,2) NOT NULL,
    razon text,
    fecha_efectiva timestamp without time zone DEFAULT now(),
    created_by character varying(255) DEFAULT 'system'::character varying,
    restaurante_id character varying(50) NOT NULL
);


ALTER TABLE public.precio_historial OWNER TO postgres;

--
-- Name: producto_versiones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto_versiones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    producto_id uuid NOT NULL,
    version integer NOT NULL,
    cambios jsonb,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    created_by character varying(255) DEFAULT 'system'::character varying,
    restaurante_id character varying(50) NOT NULL
);


ALTER TABLE public.producto_versiones OWNER TO postgres;

--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    precio_actual numeric(10,2) DEFAULT 0,
    categoria_id uuid,
    subcategoria_id uuid,
    imagen text,
    version_actual integer DEFAULT 1,
    estado character varying(20) DEFAULT 'active'::character varying,
    stock_actual integer DEFAULT 0,
    stock_minimo integer DEFAULT 0,
    stock_maximo integer DEFAULT 100,
    restaurante_id character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    created_by character varying(255) DEFAULT 'system'::character varying,
    updated_by character varying(255) DEFAULT 'system'::character varying,
    CONSTRAINT productos_estado_check CHECK (((estado)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'draft'::character varying])::text[])))
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: restaurantes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurantes (
    id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    direccion text,
    telefono character varying(20),
    email character varying(255),
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.restaurantes OWNER TO postgres;

--
-- Name: stock_actualizaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_actualizaciones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    producto_id uuid NOT NULL,
    cantidad integer NOT NULL,
    tipo character varying(20) NOT NULL,
    razon text,
    "timestamp" timestamp without time zone DEFAULT now(),
    updated_by character varying(255) DEFAULT 'system'::character varying,
    restaurante_id character varying(50) NOT NULL,
    CONSTRAINT stock_actualizaciones_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['increment'::character varying, 'decrement'::character varying, 'set'::character varying])::text[])))
);


ALTER TABLE public.stock_actualizaciones OWNER TO postgres;

--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id, nombre, tipo, orden, descripcion, restaurante_id, activo, created_at, updated_at) FROM stdin;
c1111111-1111-1111-1111-111111111111	Entradas	categoria	1	Sopas y entradas	default	t	2025-07-01 16:54:30.269241	2025-07-01 16:54:30.269241
c2222222-2222-2222-2222-222222222222	Principios	categoria	2	Platos principales	default	t	2025-07-01 16:54:30.269241	2025-07-01 16:54:30.269241
c3333333-3333-3333-3333-333333333333	Proteínas	categoria	3	Carnes y proteínas	default	t	2025-07-01 16:54:30.269241	2025-07-01 16:54:30.269241
c4444444-4444-4444-4444-444444444444	Acompañamientos	categoria	4	Guarniciones y acompañamientos	default	t	2025-07-01 16:54:30.269241	2025-07-01 16:54:30.269241
c5555555-5555-5555-5555-555555555555	Bebidas	categoria	5	Bebidas y jugos	default	t	2025-07-01 16:54:30.269241	2025-07-01 16:54:30.269241
d1111111-1111-1111-1111-111111111111	entrada	subcategoria	1	Sopas y entradas	default	t	2025-07-01 16:54:30.272867	2025-07-01 16:54:30.272867
d2222222-2222-2222-2222-222222222222	principio	subcategoria	2	Platos principales	default	t	2025-07-01 16:54:30.272867	2025-07-01 16:54:30.272867
d3333333-3333-3333-3333-333333333333	proteina	subcategoria	3	Carnes y proteínas	default	t	2025-07-01 16:54:30.272867	2025-07-01 16:54:30.272867
d4444444-4444-4444-4444-444444444444	acompanamiento	subcategoria	4	Guarniciones y acompañamientos	default	t	2025-07-01 16:54:30.272867	2025-07-01 16:54:30.272867
d5555555-5555-5555-5555-555555555555	bebida	subcategoria	5	Bebidas y jugos	default	t	2025-07-01 16:54:30.272867	2025-07-01 16:54:30.272867
\.


--
-- Data for Name: combinacion_productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.combinacion_productos (id, combinacion_id, producto_id, cantidad, precio_unitario, created_at) FROM stdin;
\.


--
-- Data for Name: combinaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.combinaciones (id, nombre, descripcion, precio_total, es_favorito, es_especial, cantidad, restaurante_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: menu_productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_productos (id, menu_id, producto_id, precio_menu, disponible, orden, created_at) FROM stdin;
\.


--
-- Data for Name: menus; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menus (id, nombre, descripcion, fecha_inicio, fecha_fin, activo, restaurante_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: precio_historial; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.precio_historial (id, producto_id, precio_anterior, precio_nuevo, razon, fecha_efectiva, created_by, restaurante_id) FROM stdin;
\.


--
-- Data for Name: producto_versiones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producto_versiones (id, producto_id, version, cambios, metadata, created_at, created_by, restaurante_id) FROM stdin;
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id, nombre, descripcion, precio_actual, categoria_id, subcategoria_id, imagen, version_actual, estado, stock_actual, stock_minimo, stock_maximo, restaurante_id, created_at, updated_at, created_by, updated_by) FROM stdin;
f1111111-1111-1111-1111-111111111111	Sopa de Guineo	Sopa tradicional con plátano verde	8500.00	c1111111-1111-1111-1111-111111111111	d1111111-1111-1111-1111-111111111111	\N	1	active	10	5	50	default	2025-07-01 16:54:30.275924	2025-07-01 16:54:30.275924	system	system
f2222222-2222-2222-2222-222222222222	Ajiaco	Sopa típica con tres tipos de papa, pollo y guascas	12000.00	c1111111-1111-1111-1111-111111111111	d1111111-1111-1111-1111-111111111111	\N	1	active	15	5	50	default	2025-07-01 16:54:30.275924	2025-07-01 16:54:30.275924	system	system
f3333333-3333-3333-3333-333333333333	Frijoles	Frijoles rojos cocinados con plátano y costilla	15000.00	c2222222-2222-2222-2222-222222222222	d2222222-2222-2222-2222-222222222222	\N	1	active	20	5	100	default	2025-07-01 16:54:30.275924	2025-07-01 16:54:30.275924	system	system
f4444444-4444-4444-4444-444444444444	Pechuga a la Plancha	Pechuga de pollo a la plancha con especias	18000.00	c3333333-3333-3333-3333-333333333333	d3333333-3333-3333-3333-333333333333	\N	1	active	25	8	100	default	2025-07-01 16:54:30.275924	2025-07-01 16:54:30.275924	system	system
f5555555-5555-5555-5555-555555555555	Arroz Blanco	Arroz blanco cocido al vapor	5000.00	c4444444-4444-4444-4444-444444444444	d4444444-4444-4444-4444-444444444444	\N	1	active	50	20	200	default	2025-07-01 16:54:30.275924	2025-07-01 16:54:30.275924	system	system
f6666666-6666-6666-6666-666666666666	Jugo de Mora	Jugo en agua de mora	4000.00	c5555555-5555-5555-5555-555555555555	d5555555-5555-5555-5555-555555555555	\N	1	active	45	15	150	default	2025-07-01 16:54:30.275924	2025-07-01 16:54:30.275924	system	system
\.


--
-- Data for Name: restaurantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurantes (id, nombre, descripcion, direccion, telefono, email, activo, created_at, updated_at) FROM stdin;
default	SPOON Restaurant	Restaurante de comida tradicional	Calle Principal 123	+57 300 123 4567	info@spoon.com	t	2025-07-01 16:54:30.267125	2025-07-01 16:54:30.267125
\.


--
-- Data for Name: stock_actualizaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_actualizaciones (id, producto_id, cantidad, tipo, razon, "timestamp", updated_by, restaurante_id) FROM stdin;
\.


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: combinacion_productos combinacion_productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.combinacion_productos
    ADD CONSTRAINT combinacion_productos_pkey PRIMARY KEY (id);


--
-- Name: combinaciones combinaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.combinaciones
    ADD CONSTRAINT combinaciones_pkey PRIMARY KEY (id);


--
-- Name: menu_productos menu_productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_productos
    ADD CONSTRAINT menu_productos_pkey PRIMARY KEY (id);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- Name: precio_historial precio_historial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.precio_historial
    ADD CONSTRAINT precio_historial_pkey PRIMARY KEY (id);


--
-- Name: producto_versiones producto_versiones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_versiones
    ADD CONSTRAINT producto_versiones_pkey PRIMARY KEY (id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: restaurantes restaurantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurantes
    ADD CONSTRAINT restaurantes_pkey PRIMARY KEY (id);


--
-- Name: stock_actualizaciones stock_actualizaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_actualizaciones
    ADD CONSTRAINT stock_actualizaciones_pkey PRIMARY KEY (id);


--
-- Name: idx_categorias_restaurante; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categorias_restaurante ON public.categorias USING btree (restaurante_id);


--
-- Name: idx_categorias_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categorias_tipo ON public.categorias USING btree (tipo);


--
-- Name: idx_precio_historial_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_precio_historial_producto ON public.precio_historial USING btree (producto_id);


--
-- Name: idx_productos_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_categoria ON public.productos USING btree (categoria_id);


--
-- Name: idx_productos_restaurante; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_restaurante ON public.productos USING btree (restaurante_id);


--
-- Name: idx_productos_subcategoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_subcategoria ON public.productos USING btree (subcategoria_id);


--
-- Name: idx_stock_actualizaciones_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_actualizaciones_producto ON public.stock_actualizaciones USING btree (producto_id);


--
-- Name: categorias update_categorias_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: combinaciones update_combinaciones_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_combinaciones_updated_at BEFORE UPDATE ON public.combinaciones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: menus update_menus_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: productos update_productos_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: restaurantes update_restaurantes_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_restaurantes_updated_at BEFORE UPDATE ON public.restaurantes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: categorias categorias_restaurante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_restaurante_id_fkey FOREIGN KEY (restaurante_id) REFERENCES public.restaurantes(id);


--
-- Name: combinacion_productos combinacion_productos_combinacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.combinacion_productos
    ADD CONSTRAINT combinacion_productos_combinacion_id_fkey FOREIGN KEY (combinacion_id) REFERENCES public.combinaciones(id) ON DELETE CASCADE;


--
-- Name: combinacion_productos combinacion_productos_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.combinacion_productos
    ADD CONSTRAINT combinacion_productos_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- Name: combinaciones combinaciones_restaurante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.combinaciones
    ADD CONSTRAINT combinaciones_restaurante_id_fkey FOREIGN KEY (restaurante_id) REFERENCES public.restaurantes(id);


--
-- Name: menu_productos menu_productos_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_productos
    ADD CONSTRAINT menu_productos_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE;


--
-- Name: menu_productos menu_productos_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_productos
    ADD CONSTRAINT menu_productos_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- Name: menus menus_restaurante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_restaurante_id_fkey FOREIGN KEY (restaurante_id) REFERENCES public.restaurantes(id);


--
-- Name: precio_historial precio_historial_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.precio_historial
    ADD CONSTRAINT precio_historial_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- Name: precio_historial precio_historial_restaurante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.precio_historial
    ADD CONSTRAINT precio_historial_restaurante_id_fkey FOREIGN KEY (restaurante_id) REFERENCES public.restaurantes(id);


--
-- Name: producto_versiones producto_versiones_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_versiones
    ADD CONSTRAINT producto_versiones_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- Name: producto_versiones producto_versiones_restaurante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_versiones
    ADD CONSTRAINT producto_versiones_restaurante_id_fkey FOREIGN KEY (restaurante_id) REFERENCES public.restaurantes(id);


--
-- Name: productos productos_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id);


--
-- Name: productos productos_restaurante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_restaurante_id_fkey FOREIGN KEY (restaurante_id) REFERENCES public.restaurantes(id);


--
-- Name: productos productos_subcategoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_subcategoria_id_fkey FOREIGN KEY (subcategoria_id) REFERENCES public.categorias(id);


--
-- Name: stock_actualizaciones stock_actualizaciones_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_actualizaciones
    ADD CONSTRAINT stock_actualizaciones_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- Name: stock_actualizaciones stock_actualizaciones_restaurante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_actualizaciones
    ADD CONSTRAINT stock_actualizaciones_restaurante_id_fkey FOREIGN KEY (restaurante_id) REFERENCES public.restaurantes(id);


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

