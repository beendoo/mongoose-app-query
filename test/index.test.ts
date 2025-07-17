import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Schema, model } from 'mongoose';
import AppQuery from '../src/app'; // Adjust import path as needed

interface IUser extends mongoose.Document {
  name: string;
  email: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
});
const User = model<IUser>('User', UserSchema);

jest.setTimeout(30000); // increase timeout for MongoMemoryServer startup

describe('AppQuery', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri()); // No need for deprecated options
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await User.create([
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
      { name: 'Charlie', email: 'charlie@example.com' },
    ]);
  });

  test('search by name returns correct result', async () => {
    const query = User.find();
    const queryParams = { search: 'ali' };
    const appQuery = new AppQuery(query, queryParams);
    const result = await appQuery.search(['name']).execute();

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Alice');
    expect(result.meta.total).toBe(1);
  });

  test('pagination works correctly', async () => {
    const query = User.find().sort('name'); // consistent order
    const queryParams = { page: '2', limit: '1' };
    const appQuery = new AppQuery(query, queryParams);
    const result = await appQuery.paginate().execute();

    expect(result.data).toHaveLength(1);
    expect(result.meta.page).toBe(2);
    expect(result.meta.limit).toBe(1);
    expect(result.data[0].name).toBe('Bob');
  });

  test('count only returns total without data', async () => {
    const query = User.find();
    const queryParams = { is_count_only: 'true' };
    const appQuery = new AppQuery(query, queryParams);
    const result = await appQuery.execute();

    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(3);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(0);
  });

  test('filter returns correct documents', async () => {
    const query = User.find();
    const queryParams = { email: 'bob@example.com' };
    const appQuery = new AppQuery(query, queryParams);
    const result = await appQuery.filter(['email']).execute();

    expect(result.data).toHaveLength(1);
    expect(result.data[0].email).toBe('bob@example.com');
  });

  test('sort returns results in correct order', async () => {
    const query = User.find();
    const queryParams = { sort: '-name' };
    const appQuery = new AppQuery(query, queryParams);
    const result = await appQuery.sort(['name']).execute();

    expect(result.data[0].name).toBe('Charlie');
    expect(result.data[2].name).toBe('Alice');
  });

  test('fields limits selected fields', async () => {
    const query = User.find();
    const queryParams = { fields: 'name' };
    const appQuery = new AppQuery(query, queryParams);
    const result = await appQuery.fields(['name']).execute();

    expect(result.data[0]).toHaveProperty('name');
    expect(result.data[0].email).toBeUndefined();
  });

  test('lean returns plain objects instead of mongoose documents', async () => {
    const query = User.find();
    const queryParams = {};
    const appQuery = new AppQuery(query, queryParams);
    const result = await appQuery.lean().execute();

    expect(result.data).toHaveLength(3);
    expect(typeof result.data[0]).toBe('object');
    expect('_doc' in result.data[0]).toBe(false);
  });
});
