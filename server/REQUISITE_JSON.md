# Operators

## And

Accepts `boolean[]`, return `boolean`.
If all of the booleans are `true`, return true. Otherwise, return `false`.

```
{
    "and": [
        boolean, boolean, boolean...
    ]
}
```

## Or

Accepts `boolean[]`, return `boolean`.
If any of the booleans are `true`, return true. Otherwise, return `false`.

```
{
    "or": [
        boolean, boolean, boolean...
    ]
}
```

## Not

Accepts `boolean`, return `boolean`.
If the boolean is `true`, return `false`. Otherwise, return `true`.

```
{
    "not": boolean
}
```

## Units

Accepts:

- `units`: the number of units to satisfy
- `from`: an array of conditions that represent the units that the units must be taken from
- `include`: an array of courses that represent the units that the units must be taken from
- `exclude`: an array of courses that represent the units that the units cannot be taken from
- `field`: a field of study that the units must satisfy
- `level`: a level of course number that the units must satisfy
- `subject`: a subject code that the units must satisfy

If the number of units that satisfies all the properties is greater than or equal to the given number, return `true` Otherwise, return `false`.

```
{
    "units": number,
    "from": any[],
    "include": Course[],
    "exclude": Course[],
    "field": string,
    "level": Level,
    "subject": Subject,
}
```

## Consent

Accepts an object as the consenter, return `boolean`.
If the consent is satisfied, return `true`. Otherwise, return `false`.

```
{
    "consent": Faculty | Department
}
```

## Admission

Accepts an object as the admittee, return `boolean`.
If the admittee is admitted, return `true`. Otherwise, return `false`.

```
{
    "admission": Faculty | Department | Program
}
```

## Year

Accepts the year of study, return `boolean`.
If the year of study is at least the given year, return `true`. Otherwise, return `false`.

```
{ "year": "first" | "second" | "third" | "fourth" | "fifth" }
```

# Properties

## Course

Defines a course, of type `string`. It is usually starts with four capital-letter subject code and followed by a three-digit course number.

## Faculty

Defines a faculty, which is an enum of all the faculty codes.

```

{ "faculty": string }

```

## Department

Defines a department, which is an enum of all the department codes.

```

{ "department": string }

```

## Program

Defines a program.

```

{
    "program": string,
    "faculty": Faculty,
    "department": Department,
    "honours": boolean,
    "type": "major" | "minor" | "concentration",
    "degree": string,
    "career": "undergraduate" | "graduate" | "doctoral"
    "year": Year
    "gpa": number
}

```

## Level

Defines the level of a course. The level is ranging from 10 to 700.
When the level is represented in a pure number, it is the exact level that the course must satisfy.
When the level is represented in a pure number followed by a `+`, it is the minimum level that the course must satisfy.

## Subject

Defines the subject code of a course.

## Course

Defines the course code of a course.
