/*
  content/people.js
  ------------------
  Every person referenced anywhere in the project, in one place.

  WHY ONE FILE INSTEAD OF ONE-PER-PERSON:
  Person entries are tiny (just an id and a name), so splitting them
  into separate files the way documents are split would add overhead
  without making anything easier to maintain. Documents reference
  people by id below, which is what keeps a name from being spelled
  four different ways across the project.

  TO ADD A NEW PERSON:
  1. Pick the next unused P-### id.
  2. Add a new { id, name } entry to the array below.
  3. Reference that id in any document's `people` array.

  Never reuse or renumber an existing id — documents elsewhere in the
  project depend on it staying the same.
*/

export const PEOPLE = [
  { id: "P-001", name: "Jane Doe #1" },
  { id: "P-002", name: "Jane Doe #2" },
  { id: "P-003", name: "Jane Doe #3" },
  { id: "P-004", name: "Jane Doe #4" },
  { id: "P-005", name: "Jane Doe #5" },
  { id: "P-006", name: "John Doe #1" },
  { id: "P-007", name: "John Doe #2" },
  { id: "P-008", name: "John Doe #3" },
  { id: "P-009", name: "John Doe #4" },
  { id: "P-010", name: "John Doe #5" },
];
