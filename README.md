﻿# mongoose-app-query

A wrapper class that enhances Mongoose queries with clean chaining for pagination, filtering, searching, sorting, field selection, and lean query support.

---

## ✨ Features

- ✅ Clean chainable API
- 🔍 Search by specific fields
- 📑 Pagination support
- 🔢 Filtering by any query field
- ↕️ Sorting
- 🔐 Field selection
- 🪶 Lean query support
- 📊 Count-only query support
- 🔗 Seamless frontend-driven query support (perfect for single-endpoint APIs)
- 🧠 Full TypeScript support

---

## 📦 Installation

```bash
npm install mongoose-app-query
# or
yarn add mongoose-app-query
# or
pnpm add mongoose-app-query
```

---

## 🔗 Frontend-Driven Queries (Single API Endpoint Design)

Using `AppQuery` allows your frontend to send query parameters directly, enabling dynamic filtering, pagination, searching, and sorting—all through a single API endpoint.

This design pattern makes your backend flexible and minimizes code repetition.

### ✅ Benefits

- One endpoint, multiple use cases
- Query operations controlled dynamically from frontend
- Backend can selectively enable/disable operations via method chaining
- Great for dashboards, admin panels, and advanced filtering systems

### 📲 Example: Frontend → Backend

#### Frontend Code

```ts
const query = new URLSearchParams({
  page: '1',
  limit: '10',
  search: 'john',
  searchFields: 'name,email',
  sort: '-createdAt',
  fields: 'name,email',
}).toString();

fetch(`/api/users?${query}`);
```

#### Backend Code

```ts
import { AppQuery } from 'mongoose-app-query';
import UserModel from '../models/user.model';

const getUsers = async (req, res) => {
  const searchableFields = ['name', 'email'];

  const result = await new AppQuery(UserModel.find(), req.query)
    .search(searchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()
    .execute();

  res.json(result);
};
```

---

## 🧠 Usage

### Full Example

```ts
const result = await new AppQuery(UserModel.find(), req.query)
  .lean()
  .search(['name', 'email'])
  .filter()
  .sort()
  .fields()
  .paginate()
  .execute();
```

### Count Only Query

If your query includes `is_only_count=true`, `AppQuery` will return only the total count in the response, skipping data fetching for performance.

```ts
// Query string: ?is_only_count=true

const result = await new AppQuery(UserModel.find(), req.query)
  .filter()
  .execute();

// Result:
{
  data: [],
  meta: {
    total: 143
  }
}
```

---

## 📦 API Methods

| Method       | Description                                                                |
| ------------ | -------------------------------------------------------------------------- |
| `search()`   | Enables fuzzy search on specified fields using `search` and `searchFields` |
| `filter()`   | Applies filtering using query key-value pairs                              |
| `sort()`     | Sorts results, e.g. `?sort=name` or `?sort=-createdAt`                     |
| `fields()`   | Selects fields to include, e.g. `?fields=name,email`                       |
| `paginate()` | Adds pagination via `?page=1&limit=10`                                     |
| `lean()`     | Returns plain JavaScript objects instead of Mongoose documents             |
| `execute()`  | Runs the query, returns result and meta info                               |

---

## 🧾 Response Format

By default, the response from `execute()` looks like this:

```ts
{
  data: T[],
  meta: {
    total: number,
    page?: number,
    limit?: number
  }
}
```

If `is_only_count=true` is passed in the query, the response will be:

```ts
{
  data: [],
  meta: {
    total: number
  }
}
```

---

## 🧪 TypeScript Support

Fully typed with generics for safe usage:

```ts
const result = await new AppQuery<User>(UserModel.find(), req.query)
  .lean()
  .filter()
  .execute();
```

---

## 🧪 Testing

```bash
pnpm test
```

---

## 🌐 Repository

[https://github.com/beendoo/mongoose-app-query.git](https://github.com/beendoo/mongoose-app-query.git)

---

## 📝 License

MIT © [Foysal Ahmed](https://github.com/foysalahmedmin)

<!--
npm version patch   # for 1.0.0 -> 1.0.1
npm version minor   # for 1.0.0 -> 1.1.0
npm version major   # for 1.0.0 -> 2.0.0
-->
