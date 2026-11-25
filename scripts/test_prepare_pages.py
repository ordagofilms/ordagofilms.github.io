"""Regression checks for the public routes produced for GitHub Pages."""

import importlib.util
import tempfile
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit
from xml.etree import ElementTree as ET

SPEC = importlib.util.spec_from_file_location('prepare_pages', Path(__file__).with_name('prepare-pages.py'))
pages = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(pages)
SOURCE = Path(__file__).resolve().parents[1] / 'nueva-web' / 'prototipo'
ORIGIN = 'https://ordagofilms.com/'


class Elements(HTMLParser):
    def __init__(self, document):
        super().__init__()
        self.tags = []
        self.feed(document)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class PublicRoutesTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.output = Path(cls.temp.name) / 'public'
        for name in ('index.html', 'projects/ana/index.html', 'contact/index.html', 'about/index.html'):
            path = cls.output / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text('<!doctype html><html><head><title>Anterior</title></head><body></body></html>')
        pages.prepare(cls.output, SOURCE, ORIGIN)

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def detail_pages(self):
        for section, data, kind in (('cine', 'projects.js', 'project'), ('servicios', 'services.js', 'service')):
            for route in pages.detail_routes((SOURCE / section / data).read_text()):
                yield section, route, kind, self.output / section / route['slug'] / 'index.html'

    def test_direct_detail_routes_have_titles_canonicals_and_correct_resource_base(self):
        records = list(self.detail_pages())
        self.assertEqual(len(records), 9)
        for section, route, kind, path in records:
            with self.subTest(path=path):
                text = path.read_text()
                tags = Elements(text).tags
                self.assertIn(f'<title>{route["title"]} · Órdago Films</title>', text)
                self.assertIn(f'data-{kind}-id="{route["id"]}"', text)
                self.assertNotIn('noindex', text)
                self.assertIn(('base', {'href': f'/{section}/'}), tags)
                self.assertIn(('link', {'rel': 'canonical', 'href': f'{ORIGIN}{section}/{route["slug"]}/'}), tags)
                base = urljoin(ORIGIN, f'{section}/')
                for tag, attrs in tags:
                    resource = attrs.get('src') if tag == 'script' else attrs.get('href') if attrs.get('rel') == 'stylesheet' else None
                    if resource:
                        target = self.output / urlsplit(urljoin(base, resource)).path.lstrip('/')
                        self.assertTrue(target.is_file(), str(target))

    def test_sitemap_contains_current_pages_and_legal_information(self):
        root = ET.parse(self.output / 'sitemap.xml').getroot()
        urls = [node.text for node in root.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
        self.assertEqual(len(urls), 15)
        self.assertIn(ORIGIN + 'privacidad/', urls)
        self.assertNotIn(ORIGIN + 'gestor/', urls)
        self.assertIn(ORIGIN + 'cine/m/', urls)
        self.assertIn(ORIGIN + 'cine/quien-se-casa-en-julio-en-jaen/', urls)
        self.assertIn(ORIGIN + 'servicios/video-corporativo/', urls)
        self.assertTrue(all(url.endswith('/') and '.html' not in url and '?' not in url for url in urls))

    def test_navigation_targets_exist_and_no_longer_use_html_or_query_ids(self):
        paths = [path for path in self.output.rglob('*.html') if 'web-anterior' not in path.parts and 'projects' not in path.parts and path.parent.name not in ('about', 'contact')]
        for path in paths:
            tags = Elements(path.read_text()).tags
            base = urljoin(ORIGIN, str(path.relative_to(self.output)))
            base = next((urljoin(base, attrs['href']) for tag, attrs in tags if tag == 'base'), base)
            for tag, attrs in tags:
                if tag != 'a' or not attrs.get('href'):
                    continue
                href = attrs['href']
                url = urlsplit(urljoin(base, href))
                if url.netloc != 'ordagofilms.com' or url.scheme not in ('https', 'http'):
                    continue
                with self.subTest(page=path, href=href):
                    self.assertNotIn('index.html', href)
                    self.assertNotIn('.html?id=', href)
                    target = self.output / url.path.lstrip('/')
                    if url.path.endswith('/'):
                        target /= 'index.html'
                    self.assertTrue(target.is_file(), str(target))

    def test_legacy_detail_urls_remain_available_but_outside_search(self):
        for relative in ('cine/proyecto.html', 'servicios/servicio.html'):
            text = (self.output / relative).read_text()
            self.assertIn('noindex,follow', text)
        self.assertIn('https://ordagofilms.com/cine/ana/', (self.output / 'projects/ana/index.html').read_text())
        self.assertIn('noindex,follow', (self.output / 'web-anterior/index.html').read_text())

    def test_missing_duplicate_or_unsafe_slugs_fail_the_build(self):
        for data in (
            "[{ id: 'one', title: 'One' }]",
            "[{ id: 'one', slug: '../outside', title: 'One' }]",
            "[{ id: 'one', slug: 'same', title: 'One' }, { id: 'two', slug: 'same', title: 'Two' }]",
        ):
            with self.subTest(data=data), self.assertRaises(ValueError):
                pages.detail_routes(data)

    def test_nested_hosting_base_is_preserved(self):
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder)
            pages.publish_detail_pages(output, SOURCE, 'https://example.com/site/')
            text = (output / 'cine/tonos/index.html').read_text()
            self.assertIn('<base href="/site/cine/">', text)
            self.assertIn('href="https://example.com/site/cine/tonos/"', text)

    def test_detail_content_is_present_without_running_javascript(self):
        for section, route, kind, path in self.detail_pages():
            with self.subTest(path=path):
                text = path.read_text()
                if route.get('description'):
                    self.assertIn(route['description'], text)
                self.assertNotIn('Servicio no disponible', text)
                self.assertNotIn('Proyecto no disponible', text)
                self.assertTrue(any(tag == 'meta' and attrs.get('name') == 'description' and attrs.get('content') for tag, attrs in Elements(text).tags))

    def test_forms_have_unique_explicit_labels_and_privacy_information(self):
        for relative in ('index.html', 'cine/index.html', 'servicios/index.html'):
            tags = Elements((self.output / relative).read_text()).tags
            ids = [attrs['id'] for _, attrs in tags if attrs.get('id')]
            self.assertFalse(any(ord(character) < 32 and character not in '\n\r\t' for character in (self.output / relative).read_text()))
            self.assertEqual(len(ids), len(set(ids)))
            labels = {attrs['for'] for tag, attrs in tags if tag == 'label' and attrs.get('for')}
            for tag, attrs in tags:
                if tag in ('input', 'textarea'):
                    self.assertIn(attrs['id'], labels)
                    self.assertIn(attrs['aria-describedby'], ids)
            self.assertIn(('a', {'href': '/privacidad/'}), tags)

    def test_cookie_panel_and_alternate_form_label_every_control_explicitly(self):
        # TAW (WCAG 1.1.1, 1.3.1, 3.3.2, 4.1.2) requires each control to be named by a label with for/id.
        for relative in ('consent.js', 'portada-sin-naipes.html'):
            with self.subTest(file=relative):
                tags = Elements((SOURCE / relative).read_text()).tags
                labels = [attrs.get('for') for tag, attrs in tags if tag == 'label']
                controls = [attrs for tag, attrs in tags if tag in ('input', 'textarea', 'select')]
                self.assertTrue(controls)
                self.assertTrue(all(labels))
                for attrs in controls:
                    self.assertIn(attrs.get('id'), labels)

    def test_detail_pages_describe_the_film_or_service_for_search_engines(self):
        import json
        for section, route, kind, path in self.detail_pages():
            with self.subTest(path=path):
                text = path.read_text()
                tags = Elements(text).tags
                image = next(attrs['content'] for tag, attrs in tags if tag == 'meta' and attrs.get('property') == 'og:image')
                self.assertNotIn('logo.png', image)
                self.assertTrue((self.output / urlsplit(image).path.lstrip('/')).is_file(), image)
                data = [json.loads(block) for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S)]
                types = {item['@type']: item for item in data}
                self.assertEqual(types['Movie' if kind == 'project' else 'Service']['name'], route['title'])
                self.assertEqual(types['BreadcrumbList']['itemListElement'][-1]['item'], f'{ORIGIN}{section}/{route["slug"]}/')
                self.assertIn('Organization', types)

    def test_editor_content_escapes_html_and_supports_english_pages(self):
        import json
        import shutil
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / 'source'
            shutil.copytree(SOURCE, source)
            data = json.loads((source / 'site-content.json').read_text())
            data['pages']['home']['heading'] = '<script>alert(1)</script>'
            data['articles'] = [{'title': 'About our films', 'slug': 'our-films', 'language': 'en', 'description': 'Films and audiovisual work.', 'body': 'First paragraph.\n\nSecond paragraph.'}]
            (source / 'site-content.json').write_text(json.dumps(data))
            output = Path(folder) / 'public'
            output.mkdir()
            (output / 'index.html').write_text('<html><head><title>Old</title></head><body></body></html>')
            pages.prepare(output, source, ORIGIN)
            home = (output / 'index.html').read_text()
            self.assertIn('&lt;script&gt;alert(1)&lt;/script&gt;', home)
            article = (output / 'en/contenidos/our-films/index.html').read_text()
            self.assertIn('<html lang="en">', article)
            self.assertIn('<p>First paragraph.</p><p>Second paragraph.</p>', article)


if __name__ == '__main__':
    unittest.main()
