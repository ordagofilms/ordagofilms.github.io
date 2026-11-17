"""Render shared SEO, legal pages, footer and editable text without browser JavaScript."""

import html
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlsplit


def esc(value):
    return html.escape(str(value), quote=True)


def link(base_url, relative):
    url = urlsplit(urljoin(base_url, relative))
    return url.path + ('?' + url.query if url.query else '') + ('#' + url.fragment if url.fragment else '')


def load_content(source):
    content = json.loads((source / 'site-content.json').read_text(encoding='utf-8'))
    if content.get('version') != 1:
        raise ValueError('Unsupported site content version')
    for key in ('home', 'cine', 'servicios'):
        for field in ('title', 'description', 'heading', 'intro1', 'intro2'):
            if not isinstance(content['pages'][key].get(field), str) or not content['pages'][key][field].strip():
                raise ValueError(f'Missing text: pages.{key}.{field}')
    for article in content.get('articles', []):
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', article.get('slug', '')):
            raise ValueError('Invalid article slug')
        if article.get('language') not in ('es', 'en'):
            raise ValueError('Article language must be es or en')
        for field in ('title', 'description', 'body'):
            if not isinstance(article.get(field), str) or not article[field].strip():
                raise ValueError(f'Missing article {field}')
    keys = [(item['language'], item['slug']) for item in content.get('articles', [])]
    if len(keys) != len(set(keys)):
        raise ValueError('Duplicate article route')
    return content


def footer(company, base_url):
    links = [('Inicio', ''), ('Cine', 'cine/'), ('Servicios', 'servicios/'),
             ('Aviso legal', 'aviso-legal/'), ('Privacidad', 'privacidad/'), ('Cookies', 'cookies/')]
    nav = ''.join(f'<a href="{esc(link(base_url, path))}">{label}</a>' for label, path in links)
    return f'''<footer class="site-footer" lang="es">
  <strong>Órdago Films</strong>
  <nav aria-label="Navegación del pie de página">{nav}</nav>
  <button type="button" data-cookie-settings data-cookie-policy="{esc(link(base_url, 'cookies/'))}" hidden>Configurar cookies</button>
  <p>{esc(company['name'])} · NIF {esc(company['taxId'])}<br><a href="mailto:{esc(company['email'])}">{esc(company['email'])}</a></p>
  <div class="funding-banner-wrap"><img class="funding-banner" src="{esc(link(base_url, 'assets/banner-kit-digital.webp'))}" width="864" height="64" loading="lazy" alt="Gobierno de España, Red.es, Kit Digital, Plan de Recuperación, Transformación y Resiliencia y Unión Europea NextGenerationEU"></div>
  <p>Financiado por la Unión Europea – NextGenerationEU, en el marco del Programa Kit Digital y del Plan de Recuperación, Transformación y Resiliencia.</p>
</footer>'''


def head(document, title, description, canonical, base_url, company):
    document = re.sub(r'<title>.*?</title>', lambda _: f'<title>{esc(title)}</title>', document, count=1, flags=re.S)
    for pattern in (r'<meta\b[^>]*name="description"[^>]*>', r'<meta\b[^>]*property="og:[^"]*"[^>]*>', r'<link\b[^>]*rel="canonical"[^>]*>'):
        document = re.sub(pattern, '', document, flags=re.I)
    organization = {
        '@context': 'https://schema.org', '@type': 'Organization',
        '@id': urljoin(base_url, '#organization'), 'name': 'Órdago Films',
        'legalName': company['name'], 'url': base_url, 'email': company['email'],
        'taxID': company['taxId'],
    }
    metadata = f'''<meta name="description" content="{esc(description)}">
  <link rel="canonical" href="{esc(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Órdago Films">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(description)}">
  <meta property="og:url" content="{esc(canonical)}">
  <meta property="og:image" content="{esc(urljoin(base_url, 'assets/logo.png'))}">
  <script type="application/ld+json">{json.dumps(organization, ensure_ascii=False).replace('<', chr(92)+'u003c')}</script>
'''
    return document.replace('</head>', metadata + '</head>', 1)


def document(body, title, description, relative, base_url, company, language='es', noindex=False):
    text = f'''<!doctype html><html lang="{language}"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)}</title>
  <link rel="stylesheet" href="{esc(link(base_url, 'style.css?v=10'))}">
  <link rel="stylesheet" href="{esc(link(base_url, 'site-support.css?v=1'))}">
  <script src="{esc(link(base_url, 'consent.js?v=1'))}" defer></script>
  {('<meta name="robots" content="noindex,follow">' if noindex else '')}
</head><body>
  <a class="skip-link" href="#contenido" lang="es">Saltar al contenido</a>
  <main id="contenido" class="legal-page" tabindex="-1">
  <a href="{esc(link(base_url, ""))}" lang="es">← Órdago Films</a>{body}</main>
  {footer(company, base_url)}
</body></html>'''
    return head(text, title, description, urljoin(base_url, relative), base_url, company)


def legal_pages(company, base_url):
    name, address, email = (esc(company[key]) for key in ('name', 'address', 'email'))
    contact = f'<a href="mailto:{email}">{email}</a>'
    updated = '<p>Última actualización: 17 de noviembre de 2026.</p>'
    notice = f'''<h1>Aviso legal</h1>{updated}
<h2>Titular del sitio web</h2><p>El sitio ordagofilms.com pertenece a {name}, con NIF {esc(company['taxId'])}, domicilio en {address} y correo de contacto {contact}.</p>
<p>Datos registrales: {esc(company['registry'])}.</p>
<h2>Actividad y contacto</h2><p>Presentamos nuestra actividad de producción audiovisual y cinematográfica, nuestros servicios y proyectos. Las consultas y solicitudes de presupuesto se atienden por correo electrónico. Esta web no permite contratar ni pagar servicios directamente.</p>
<h2>Uso del sitio y propiedad intelectual</h2><p>Utiliza la web de forma lícita y respetuosa. Los textos, diseños, fotografías, marcas y obras audiovisuales están protegidos por sus correspondientes derechos. Su aparición en esta web no concede una licencia para reproducirlos o explotarlos fuera de los usos permitidos por la ley o autorizados por sus titulares.</p>
<h2>Información y enlaces</h2><p>Procuramos mantener la información actualizada. Las características y condiciones de cada servicio se concretarán en la propuesta correspondiente. Los sitios de terceros enlazados tienen sus propias condiciones y políticas.</p>
<h2>Protección de datos</h2><p>Consulta cómo tratamos los datos en la <a href="{esc(link(base_url,'privacidad/'))}">política de privacidad</a> y el uso de almacenamiento en la <a href="{esc(link(base_url,'cookies/'))}">política de cookies</a>.</p>'''
    privacy = f'''<h1>Política de privacidad</h1>{updated}
<h2>Responsable del tratamiento</h2><p>{name}, NIF {esc(company['taxId'])}, con domicilio en {address}. Puedes contactar con nosotros en {contact} para consultas sobre tus datos o para ejercer tus derechos.</p>
<h2>Consultas y solicitudes de proyectos</h2><p>Tratamos el nombre, los datos de contacto y el mensaje que nos envíes para atender tu consulta, comunicarnos contigo y, cuando lo solicites, preparar una propuesta de servicios. La base jurídica son las medidas precontractuales solicitadas por ti cuando pides una propuesta; para otras consultas, nuestro interés legítimo en responder a quien contacta con nosotros.</p>
<p>Los campos obligatorios se identifican con un asterisco. El formulario prepara un borrador en tu aplicación de correo y no envía el mensaje por sí mismo. Recibimos la información cuando confirmas el envío en esa aplicación. No incluyas datos sensibles ni información de otras personas que no sea necesaria para la consulta.</p>
<h2>Analítica de navegación</h2><p>Si aceptas la analítica, utilizamos Google Analytics 4 para obtener información sobre las visitas, las páginas consultadas y las características técnicas de la navegación, mediante identificadores y cookies. La base jurídica es tu consentimiento, que puedes retirar desde «Configurar cookies» en el pie de página. No activamos funciones publicitarias desde esta web. Consulta los detalles y la duración de las cookies en la <a href="{esc(link(base_url,'cookies/'))}">política de cookies</a>.</p>
<h2>Alojamiento y proveedores</h2><p>La web se aloja en GitHub Pages. GitHub puede registrar datos técnicos, como la dirección IP, para prestar el servicio y mantener su seguridad. Utilizamos también servicios de correo para gestionar las comunicaciones. Estos proveedores pueden tratar información de acuerdo con sus funciones y condiciones. Los datos de analítica se facilitan a Google cuando aceptas esa finalidad.</p>
<p>Algunos proveedores pueden tratar información fuera del Espacio Económico Europeo. Puedes consultar sus condiciones, las transferencias y las garantías que describen en la <a href="https://docs.github.com/es/site-policy/privacy-policies/github-general-privacy-statement">política de privacidad de GitHub</a> y en la <a href="https://policies.google.com/privacy?hl=es">política de privacidad de Google</a>.</p>
<h2>Conservación</h2><p>Conservamos las comunicaciones mientras sean necesarias para atender la consulta y gestionar la relación que pueda derivarse. Posteriormente se conservarán, cuando corresponda, durante los plazos legales necesarios para atender obligaciones y posibles responsabilidades. La preferencia de cookies y las cookies analíticas configuradas desde esta web tienen una duración máxima de 180 días; los datos de Analytics dependen además de la configuración de conservación de la propiedad.</p>
<h2>Tus derechos</h2><p>Puedes solicitar el acceso, rectificación, supresión, oposición, limitación y portabilidad cuando procedan, escribiendo a {contact}. También puedes retirar tu consentimiento en cualquier momento, sin afectar a la licitud del tratamiento anterior. Si consideras que no hemos atendido adecuadamente tus derechos, puedes presentar una reclamación ante la <a href="https://www.aepd.es/">Agencia Española de Protección de Datos</a>.</p>
<h2>Decisiones automatizadas</h2><p>No utilizamos los datos de contacto para adoptar decisiones automatizadas que produzcan efectos jurídicos o te afecten de manera similar.</p>'''
    cookies = f'''<h1>Política de cookies</h1>{updated}
<p>Responsable: {name}, NIF {esc(company['taxId'])}. Contacto: {contact}.</p>
<h2>Qué utilizamos y para qué</h2><p>Una cookie almacena información en tu navegador. También usamos almacenamiento local para recordar tus preferencias. La web funciona sin aceptar la analítica.</p>
<div class="table-scroll" tabindex="0" role="region" aria-label="Tabla de cookies y almacenamiento"><table><caption>Almacenamiento utilizado por esta web</caption><thead><tr><th scope="col">Nombre</th><th scope="col">Proveedor y tipo</th><th scope="col">Finalidad</th><th scope="col">Duración</th></tr></thead><tbody>
<tr><th scope="row">ordago.consent.v1</th><td>Órdago Films. Almacenamiento local técnico.</td><td>Recordar si aceptas o rechazas la analítica y cuándo lo decidiste.</td><td>180 días.</td></tr>
<tr><th scope="row">_ga</th><td>Google Analytics. Cookie analítica.</td><td>Distinguir visitas mediante un identificador.</td><td>Hasta 180 días desde su creación.</td></tr>
<tr><th scope="row">_ga_G9HX6EF6HY</th><td>Google Analytics. Cookie analítica.</td><td>Mantener información de la sesión y medir la navegación.</td><td>Hasta 180 días desde su creación.</td></tr>
</tbody></table></div>
<h2>Tu elección</h2><p>Al entrar puedes aceptar, rechazar o configurar la analítica. Google Analytics se carga después de aceptar. No se carga al rechazar ni por el mero hecho de seguir navegando. Recordamos tu elección durante 180 días y después volveremos a solicitarla.</p>
<p><button class="cookie-policy-button" type="button" data-cookie-settings hidden>Cambiar mis preferencias</button></p>
<p>Puedes retirar tu consentimiento desde este botón o desde el pie de página. Al rechazar después de haber aceptado, desactivamos la medición, eliminamos las cookies analíticas accesibles de este dominio y recargamos la página para dejar de cargar la herramienta. Puedes también borrar o bloquear cookies desde la configuración de tu navegador.</p>
<h2>Información de Google</h2><p>Google Analytics es un servicio de Google. Consulta la información sobre su tratamiento de datos y posibles transferencias en <a href="https://policies.google.com/privacy?hl=es">la política de privacidad de Google</a> y <a href="https://policies.google.com/technologies/cookies?hl=es">su información sobre cookies</a>. La retirada del consentimiento no afecta al tratamiento realizado anteriormente.</p>'''
    return {'aviso-legal/': ('Aviso legal', notice), 'privacidad/': ('Política de privacidad', privacy), 'cookies/': ('Política de cookies', cookies)}


def enhance(output, source, base_url, routes):
    content = load_content(source)
    company = content['company']
    for relative, key in (('', 'home'), ('cine/', 'cine'), ('servicios/', 'servicios')):
        path = output / relative / 'index.html'
        text = path.read_text(encoding='utf-8')
        page = content['pages'][key]
        text = head(text, page['title'], page['description'], urljoin(base_url, relative), base_url, company)
        selector = 'home-title' if key == 'home' else 'portfolio-heading'
        text = re.sub(r'(<h1[^>]*class="'+selector+r'"[^>]*>).*?(</h1>)', lambda m: m[1]+esc(page['heading'])+m[2], text, count=1, flags=re.S)
        block_class = 'about-intro' if key == 'home' else 'work-intro'
        text = re.sub(r'(<div class="'+block_class+r'">).*?(</div>)', lambda m: m[1]+f'<p>{esc(page["intro1"])}</p><p>{esc(page["intro2"])}</p>'+m[2], text, count=1, flags=re.S)
        if key != 'home':
            cards = []
            for route in routes[key]:
                title = esc(route['title'])
                if key == 'cine':
                    front = f'<img src="../assets/cine/{esc(route.get("poster", ""))}" alt="" loading="lazy" decoding="async">'
                else:
                    cover = route.get('coverImage') or ('lucera.webp' if route['id'] == 'redes' else route['id']+'-1.webp')
                    front = f'<img src="../assets/servicios/{esc(cover)}" alt="" loading="lazy" decoding="async"><span class="service-card-title">{title}</span>'
                card_class = "cine-card service-card" if key == "servicios" else "cine-card"
                cards.append(f'<li><a class="{card_class}" href="{esc(route["slug"])}/" aria-label="Ver {title}"><span class="cine-card-faces"><span class="cine-card-front">{front}</span><span class="cine-card-info"><span class="cine-card-monogram" aria-hidden="true"></span><strong>{title}</strong><span class="cine-card-action">Más información ↗</span></span></span></a></li>')
            text = text.replace('<ul class="cine-track"></ul>', '<ul class="cine-track">'+''.join(cards)+'</ul>', 1)
        text = text.replace('<!-- CONTACT_PRIVACY -->', f'<p class="contact-privacy">Responsable: {esc(company["name"])}. Usaremos tus datos para responder a tu consulta o preparar la propuesta que solicites. Puedes ejercer tus derechos en <a href="mailto:{esc(company["email"])}">{esc(company["email"])}</a>. <a href="{esc(link(base_url,"privacidad/"))}">Más información en la política de privacidad</a>.</p>')
        text = text.replace('</body>', footer(company, base_url)+'\n</body>', 1)
        path.write_text(text, encoding='utf-8')
    for section, records in routes.items():
        for route in records:
            relative = f'{section}/{route["slug"]}/'
            path = output / relative / 'index.html'
            text = path.read_text(encoding='utf-8')
            text = head(text, route['title']+' · Órdago Films', route.get('description') or route['title'], urljoin(base_url, relative), base_url, company)
            text = text.replace('</body>', footer(company, base_url)+'\n</body>', 1)
            path.write_text(text, encoding='utf-8')
    extra = []
    for relative, (title, body) in legal_pages(company, base_url).items():
        path = output / relative / 'index.html'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(document(body, title+' | Órdago Films', title+' de Órdago Films: titular, contacto e información sobre el uso de la web.', relative, base_url, company), encoding='utf-8')
        extra.append(relative)
    for article in content.get('articles', []):
        prefix = 'en/' if article['language'] == 'en' else ''
        relative = prefix+'contenidos/'+article['slug']+'/'
        paragraphs = ''.join('<p>'+esc(text)+'</p>' for text in article['body'].split('\n\n') if text.strip())
        body = '<h1>'+esc(article['title'])+'</h1>'+paragraphs
        path = output / relative / 'index.html'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(document(body, article['title']+' | Órdago Films', article['description'], relative, base_url, company, article['language']), encoding='utf-8')
        extra.append(relative)
    # This editor works locally in the browser and publishes through the owner's GitHub account.
    editor_body = (source/'editor-body.txt').read_text(encoding='utf-8')
    editor_body += f'<script src="{esc(link(base_url,"editor.js?v=1"))}" defer></script>'
    path = output/'gestor/index.html'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(document(editor_body, 'Gestor de contenidos | Órdago Films', 'Edición de textos y páginas de Órdago Films.', 'gestor/', base_url, company, noindex=True), encoding='utf-8')
    (output/'editor-body.txt').unlink(missing_ok=True)
    return extra
