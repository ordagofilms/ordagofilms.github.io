+++
author = "Mario Martín"
title = "Artículo de prueba"
image = "/img/blog/vibora.jpg"
date = "2025-01-12"
description = "Primer artículo de Órdago Films"
tags = [
    "Órdago Films",
    "Vibora",
    "Reptiles",
]
categories = [
    "Iberozoa",
    "Documental"
]
series = ["Documental"]
+++

Pequeño resumen.
<!--more-->

# Diferentes
Contenido
## Tamaños
Contenido
### De
Contenido
#### Títulos
Contenido
##### Y
Contenido

## Imagen Grande Cuadrada

![Image](/img/blog/vibora.jpg)

## Imagen Custom, con posibles estilos.

{{< customimage src="/img/blog/vibora.jpg" alt="A beautiful snake" class="rounded-lg" >}}

<!-- With optional width -->
{{< customimage src="/img/blog/vibora.jpg" alt="A beautiful snake" width="50%" >}}

<!-- With optional additional classes -->
{{< customimage src="/img/blog/vibora.jpg" alt="A beautiful snake" class="border-4 border-gray-200" >}}

## Imagen a la derecha
<!--(w: 1/2, 1/3, 1/4, 1/5)-->
{{< rightimage src="/img/blog/vibora.jpg" alt="Description of the image" 
    class="w-full md:w-1/2"
>}}

Xerum, quo qui aut unt expliquam qui dolut labo. Aque venitatiusda cum, voluptionse latur sitiae dolessi aut parist aut dollo enim qui voluptate ma dolestendit peritin re plis aut quas inctum laceat est volestemque commosa as cus endigna tectur, offic to cor sequas etum rerum idem sintibus eiur? Quianimin porecus evelectur, cum que nis nust voloribus ratem aut omnimi, sitatur? Quiatem. Nam, omnis sum am facea corem alique molestrunt et eos evelece arcillit ut aut eos eos nus, sin conecerem erum fuga. Ri oditatquam, ad quibus unda veliamenimin cusam et facea ipsamus es exerum sitate dolores editium rerore eost, temped molorro ratiae volorro te reribus dolorer sperchicium faceata tiustia prat.

{{< /rightimage >}}

<!-- With style classes -->
{{< rightimage 
    src="/img/blog/vibora.jpg" 
    alt="Description" 
    class="rounded-lg border-4 border-white w-full md:w-1/4 hover:scale-105"
>}}
Xerum, quo qui aut unt expliquam qui dolut labo. Aque venitatiusda cum, voluptionse latur sitiae dolessi aut parist aut dollo enim qui voluptate ma dolestendit peritin re plis aut quas inctum laceat est volestemque commosa as cus endigna tectur, offic to cor sequas etum rerum idem sintibus eiur? Quianimin porecus evelectur, cum que nis nust voloribus ratem aut omnimi, sitatur? Quiatem. Nam, omnis sum am facea corem alique molestrunt et eos evelece arcillit ut aut eos eos nus, sin conecerem erum fuga. Ri oditatquam, ad quibus unda veliamenimin cusam et facea ipsamus es exerum sitate dolores editium rerore eost, temped molorro ratiae volorro te reribus dolorer sperchicium faceata tiustia prat.
{{< /rightimage >}}

## YouTube Video

{{< youtube ZJthWmvUzzc >}}

##  Video

{{< vimeo 48912912 >}}

## Parrafo justificado

{{< justify >}}
Xerum, quo qui aut unt expliquam qui dolut labo. Aque venitatiusda cum, voluptionse latur sitiae dolessi aut parist aut dollo enim qui voluptate ma dolestendit peritin re plis aut quas inctum laceat est volestemque commosa as cus endigna tectur, offic to cor sequas etum rerum idem sintibus eiur? Quianimin porecus evelectur, cum que nis nust voloribus ratem aut omnimi, sitatur? Quiatem. Nam, omnis sum am facea corem alique molestrunt et eos evelece arcillit ut aut eos eos nus, sin conecerem erum fuga. Ri oditatquam, ad quibus unda veliamenimin cusam et facea ipsamus es exerum sitate dolores editium rerore eost, temped molorro ratiae volorro te reribus dolorer sperchicium faceata tiustia prat.
{{< /justify >}}

## Parrafo centrado
{{< center >}}
Centrado  
Itatur? Quiatae cullecum rem ent aut odis in re eossequodi nonsequ idebis ne sapicia is sinveli squiatum, core et que aut hariosam ex eat.
{{< /center >}}

## Enlaces con otras webs o incluso dentro de esta misma web

[Enlace a producción](/projects/mariposas/)  
[Enlace externo](https://www.google.com)

El salto de línea se puede hacer con dos espacios al final de la línea.

## Citar

Para citar puedes citar con atribución o sin atribución. Si es con atribución, puedes encontrar los detalles al final del artículo

#### Citar sin atribución

> Tiam, ad mint andaepu dandae nostion secatur sequo quae.
> **Note** that you can use *Markdown syntax* within a blockquote.

#### Citar con atribución

> Don't communicate by sharing memory, share memory by communicating.<br>
> — <cite>Rob Pike[^1]</cite>

[^1]: The above quote is excerpted from Rob Pike's [talk](https://www.youtube.com/watch?v=PAAkCSZUG1c) during Gopherfest, November 18, 2015.

## Tablas

Este es el formato para diseñar tablas

   Name | Age
--------|------
    Bob | 27
  Alice | 23

#### Tablas con formato

| Italics   | Bold     |
| --------  | -------- |
| *italics* | **bold** |


## Listas

#### Lista ordenada

1. First item
2. Second item
3. Third item

#### Lista desordenada

* List item
* Another item
* And another item

#### Lista anidada

* Fruit
  * Apple
  * Orange
  * Banana
* Dairy
  * Milk
  * Cheese
