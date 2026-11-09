"""Publish the current site while keeping legacy HTML out of search results."""

import argparse
import html
import re
import shutil
from pathlib import Path
from urllib.parse import urljoin, urlsplit
from xml.etree import ElementTree as ET

ROBOTS_META = re.compile(
    r'<meta\b[^>]*\bname\s*=\s*(?:"(?:robots|googlebot)"|\'(?:robots|googlebot)\'|(?:robots|googlebot))(?=[\s/>])[^>]*>',
    re.IGNORECASE,
)


def noindex(document):
    document = ROBOTS_META.sub('', document)
    document, count = re.subn(
        r'(<head\b[^>]*>)',
        r'\1<meta name="robots" content="noindex,follow">',
        document,
        count=1,
        flags=re.IGNORECASE,
    )
    if not count:
        raise ValueError('HTML page has no head element')
    return document


def redirect(destination):
    escaped = html.escape(destination, quote=True)
    return (
        '<!doctype html><html lang="es"><head><meta charset="utf-8">'
        '<meta name="robots" content="noindex,follow">'
        f'<meta http-equiv="refresh" content="0;url={escaped}">'
        f'<link rel="canonical" href="{escaped}">'
        '<title>Órdago Films</title></head><body>'
        f'<p>Esta página se ha trasladado. <a href="{escaped}">Ver la web actual</a>.</p>'
        '</body></html>\n'
    )


def detail_routes(data):
    """Read the explicit route fields from the site's JavaScript data records."""
    routes = []
    for record in re.split(r'\{\s*(?=id\s*:)', data)[1:]:
        fields = {}
        for field in ('id', 'slug', 'title'):
            match = re.search(r"\b" + field + r"\s*:\s*'((?:\\.|[^'\\])*)'", record)
            if not match:
                raise ValueError(f'Missing {field} in detail page record')
            fields[field] = match.group(1).replace("\\'", "'").replace('\\\\', '\\')
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', fields['slug']):
            raise ValueError(f"Invalid page slug: {fields['slug']}")
        if any(route['slug'] == fields['slug'] or route['id'] == fields['id'] for route in routes):
            raise ValueError(f"Duplicate detail page: {fields['slug']}")
        routes.append(fields)
    if not routes:
        raise ValueError('No detail page records found')
    return routes


def publish_detail_pages(output, source, base_url):
    urls = []
    for section, data, template_name, kind in (
        ('cine', 'projects.js', 'proyecto.html', 'project'),
        ('servicios', 'services.js', 'servicio.html', 'service'),
    ):
        routes = detail_routes((source / section / data).read_text(encoding='utf-8'))
        template = (source / section / template_name).read_text(encoding='utf-8')
        base_path = urlsplit(urljoin(base_url, section + '/')).path
        for route in routes:
            relative = f"{section}/{route['slug']}/"
            canonical = html.escape(urljoin(base_url, relative), quote=True)
            title = html.escape(route['title'])
            document = template.replace(
                '<html lang="es">',
                f'<html lang="es" data-{kind}-id="{html.escape(route["id"], quote=True)}">',
                1,
            )
            # Resolve all existing styles, scripts, media and back links from the section.
            document = document.replace(
                '<head>', f'<head>\n  <base href="{html.escape(base_path, quote=True)}">', 1,
            )
            document = re.sub(r'<title>[^<]*</title>', f'<title>{title} · Órdago Films</title>', document, count=1)
            document = document.replace('</head>', f'  <link rel="canonical" href="{canonical}">\n</head>', 1)
            document = re.sub(r'<h1>[^<]*</h1>', lambda _: f'<h1>{title}</h1>', document, count=1)
            path = output / relative / 'index.html'
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(document, encoding='utf-8')
            urls.append(relative)
        # Retain query-string URLs as client-side redirects, outside search results.
        (output / section / template_name).write_text(noindex(template), encoding='utf-8')
    return urls


def prepare(output, source, base_url):
    base_url = base_url.rstrip('/') + '/'
    if urlsplit(base_url).scheme != 'https' or not urlsplit(base_url).netloc:
        raise ValueError('A public HTTPS base URL is required')
    if not (output / 'index.html').is_file() or not (source / 'index.html').is_file():
        raise ValueError('Both the Hugo output and the current homepage must exist')

    # Capture the generated legacy pages before copying the current site over them.
    legacy = [
        page for page in output.rglob('*.html')
        if page.relative_to(output).parts[0] not in {'web-anterior', 'vista-previa'}
    ]
    for page in legacy:
        document = noindex(page.read_text(encoding='utf-8'))
        page.write_text(document, encoding='utf-8')
        archived = output / 'web-anterior' / page.relative_to(output)
        archived.parent.mkdir(parents=True, exist_ok=True)
        if not re.search(r'<base\b', document, re.IGNORECASE):
            document = re.sub(
                r'(<head\b[^>]*>)',
                lambda match: match.group(0) + f'<base href="{html.escape(base_url, quote=True)}">',
                document, count=1, flags=re.IGNORECASE,
            )
        archived.write_text(document, encoding='utf-8')

    # Retire the old RSS feeds so they no longer advertise the previous portfolio.
    for feed in output.rglob('index.xml'):
        feed.unlink()

    shutil.copytree(source, output, dirs_exist_ok=True)
    detail_urls = publish_detail_pages(output, source, base_url)

    for prefix in ('vista-previa', 'web-anterior'):
        for page in (output / prefix).rglob('*.html'):
            page.write_text(noindex(page.read_text(encoding='utf-8')), encoding='utf-8')
    alternate = output / 'portada-sin-naipes.html'
    if alternate.exists():
        alternate.write_text(noindex(alternate.read_text(encoding='utf-8')), encoding='utf-8')

    # GitHub Pages is static hosting, so use immediate HTML redirects for migrated URLs.
    redirects = {
        'projects/index.html': 'cine/',
        'projects/ana/index.html': 'cine/ana/',
        'about/index.html': '#conocenos',
        'contact/index.html': '#contacto',
    }
    for relative, target in redirects.items():
        path = output / relative
        if path.exists():
            path.write_text(redirect(urljoin(base_url, target)), encoding='utf-8')

    namespace = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    ET.register_namespace('', namespace)
    sitemap = ET.Element(f'{{{namespace}}}urlset')
    urls = ['', 'cine/', 'servicios/', *detail_urls]
    for relative in dict.fromkeys(urls):
        item = ET.SubElement(sitemap, f'{{{namespace}}}url')
        ET.SubElement(item, f'{{{namespace}}}loc').text = urljoin(base_url, relative)
    ET.ElementTree(sitemap).write(output / 'sitemap.xml', encoding='utf-8', xml_declaration=True)
    (output / 'robots.txt').write_text(
        f'User-agent: *\nAllow: /\n\nSitemap: {urljoin(base_url, "sitemap.xml")}\n', encoding='utf-8',
    )
    print(f'Prepared {len(legacy)} legacy pages with noindex; sitemap contains {len(urls)} current URLs.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path('public'))
    parser.add_argument('--source', type=Path, default=Path('nueva-web/prototipo'))
    parser.add_argument('--base-url', default='https://ordagofilms.com/')
    args = parser.parse_args()
    prepare(args.output, args.source, args.base_url)
