# API do BFF

[← README](../README.md)

O BFF expõe:

```
GET /health
GET /api/episodes
GET /api/episodes/:id/cast
```

```bash
curl localhost:3333/api/episodes/28/cast
```

```json
{
  "episode": {
    "number": 28,
    "name": "The Ricklantis Mixup",
    "code": "S03E07",
    "airDate": "September 10, 2017"
  },
  "characters": [
    {
      "id": 8,
      "name": "Adjudicator Rick",
      "status": "Dead",
      "species": "Human",
      "imageUrl": "https://rickandmortyapi.com/api/character/avatar/8.jpeg"
    }
  ],
  "meta": { "total": 65, "source": "origin" }
}
```

O cabeçalho `x-cache-source` indica `origin` ou `cache` — útil para observar o
cache funcionando em tempo real.

| Situação             | Status |
| -------------------- | ------ |
| Número inválido      | 400    |
| Episódio inexistente | 404    |
| Origem indisponível  | 502    |
