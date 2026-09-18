/*
  content/people.js
  ------------------
  Every person referenced anywhere in the archive, in one place.

  WHY ONE FILE INSTEAD OF ONE-PER-PERSON:
  Person entries are tiny (just an id and a name), so splitting them
  into separate files the way documents are split would add overhead
  without making anything easier to maintain. Documents reference
  people by id below, which is what keeps a name from being spelled
  four different ways across the archive.

  TO ADD A NEW PERSON:
  1. Pick the next unused P-### id.
  2. Add a new { id, name } entry to the array below.
  3. Reference that id in any document's `people` array.

  Never reuse or renumber an existing id — documents elsewhere in the
  archive depend on it staying the same.
*/

export const PEOPLE = [
  { id: "P-001", name: "John Doe #7" },
  { id: "P-002", name: "Jane Doe #3" },
  { id: "P-003", name: "Robert Doe #2" },
  { id: "P-004", name: "Mary Doe #5" },
  { id: "P-005", name: "Charles Doe #1" },
];
