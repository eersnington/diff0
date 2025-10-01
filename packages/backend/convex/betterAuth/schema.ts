import { defineSchema } from "convex/server";
import { tables } from "./generatedSchema";

const schema = defineSchema({
  ...tables,
  // Spread the generated schema and add a custom index
  // user: tables.user.index("custom_index", ["field1", "field2"]),
});

export default schema;
