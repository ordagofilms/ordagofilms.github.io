"""Regression checks for the public routes produced for GitHub Pages."""

import importlib.util
import tempfile
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
        self.assertEqual(len(records), 8)
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

    def test_sitemap_contains_only_the_eleven_clean_public_urls(self):
        root = ET.parse(self.output / 'sitemap.xml').getroot()
        urls = [node.text for node in root.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
        self.assertEqual(len(urls), 11)
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


if __name__ == '__main__':
    unittest.main()
