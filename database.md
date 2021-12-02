--------------------------------------------------------------------
====================================================================
--------------------------------------------------------------------
                            JSON DATABASE

FILE: "posts.json"

TABLE: `entries`

{
    "entries": [ 
            { 
                "id": "p7",
                "author": "POST AUTHOR",
                "title" : "POST TITLE",
                "image": "IMAGES/IMAGELOCATION.png",
                "content": "POST CONTENT BODY",
                "link": "PROJECT LINK",
                "date": "2021, 2, 28"
            },
            ...
    ]
}

The original storage solution for blog posts. I preferred this model over an XML solution as I preferred the readability.
The solution became redundant as I moved things over to the SQL database, as I needed a storage solution that was more dynamic
than a static data structure.
--------------------------------------------------------------------
====================================================================
--------------------------------------------------------------------
                            XML DATABASE

FILE: "posts.xml"

TABLE: `entries`

FIELDS & DATA TYPES :
<entries>
    <post id="6">
        <postId>6</postId>
        <author>POST AUTHOR</author>
        <title>POST TITLE</title>
        <image>IMAGES/IMAGELOCATION.png</image>
        <content>POST CONTENT BODY</content>
        <link>PROJECT LINK</link>
        <date>2021, 2, 28</date>
    </post>
    ...
</entries>

Implemented as a second option for a static blog post storage solution, 
the solution worked well in terms of display purposes but lost out to JSON as I preferred
the readability.
Still active for demonstration purposes and can be accessed via the work (XML) link in the navbar if
the link is active (uncommented) in layout.hbs.
Could be used towards some form of RSS feed.
--------------------------------------------------------------------
====================================================================
--------------------------------------------------------------------

                            SQL DATABASE

FILE: "SQLdatabase"

TABLE: `users`

FIELDS & DATA TYPES : 
|`id` INTEGER, PRIMARY KEY, AUTOINCREMENTS|,
|`name` VARCHAR(255)|,
|`email` VARCHAR(255), UNIQUE|,
|`password` VARCHAR(255)|,
|`passwordSalt` VARCHAR(512)|,
|`posts` INTEGER|,
|`joined` VARCHAR(255)|

----------------------------------------------------------------------

TABLE: `blog`

FIELDS & DATA TYPES : 
|`id` INTEGER, PRIMARY KEY, AUTOINCREMENTS|,
|`author` VARCHAR(255)|,
|`title` VARCHAR(255), UNIQUE|,
|`image` VARCHAR(255)|,
|`content` BLOB|,
|`link` VARCHAR(255)|
--------------------------------------------------------------------
====================================================================
--------------------------------------------------------------------

   

