/*
This global utility handles serialization of MongoDB uuids:

* Converts ObjectId fields (or any other field ending in Id) to strings.
* Handles nested objects and arrays.
* Leaves other data types untouched.

*/
export function serializeMongoId(data: any): any {
  if (Array.isArray(data)) {
    return data.map(serializeMongoId);
  }

  if (data && typeof data === "object" && !(data instanceof Date)) {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] =
        key === "_id" || key.endsWith("Id")
          ? data[key]?.toString()
          : serializeMongoId(data[key]);
      return acc;
    }, {} as any);
  }

  return data;
}
