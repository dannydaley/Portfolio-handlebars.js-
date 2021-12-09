--------------------------------------------------------------------
====================================================================
--------------------------------------------------------------------
                            JSON DATABASE

The original storage solution for blog posts. I preferred this model over an XML solution as I preferred
the readability. Whereas this solution became redundant with the implementation of the SQL database, it is
now referenced on initialization of the SQL database to avoid hardcoded values in the local files. This file
is rewritten when posts are created and deleted in the SQL database so that the held data stays upto date and
relevant.

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


--------------------------------------------------------------------
====================================================================
--------------------------------------------------------------------
                            XML DATABASE

Implemented as a second option for a static blog post storage solution, 
the solution worked well in terms of display purposes but lost out to JSON as I preferred
the readability.
Still active for demonstration purposes and can be accessed via the work (XML) link in the navbar if
the link is active (uncommented) in layout.hbs.
Could be used towards some form of RSS feed.

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


--------------------------------------------------------------------
====================================================================
--------------------------------------------------------------------

                            SQL DATABASE

My preferred choice for a storage solution. As the SQL database allows for multiple tables within a single space
and holds data continuously between server restarts, so it felt like a good fit for the main storage solution for my portfolio.
The added benefit of being able to use the tables relationally was another great plus over the previous iterations of storage solution
attempts such as the XML and JSON alternatives.

SQLite3 database set up in App.js under the variable `SQLdatabase`, table setup is performed from the endpoints '/SQLDatabaseUserSetup' and '/SQLDatabaseBlogSetup'.
Each deleting the existing table and recreating it with data pulled from the 'posts.json' file.

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

   

