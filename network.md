================================================================

ENDPOINT => METHOD

EXPLANATION

REQUIRED PARAMETERS

FORMAT

=================================================================

'/SQLDatabaseUserSetup' => GET 

Sets up the users table in the SQL database.

-----------------------------------------------------------------

'/getAllUsers' => GET    

(FOR TESTING PURPOSES ONLY) Serves the user with all user data from the users table.

-----------------------------------------------------------------

'/SQLDatabaseBlogSetup' => GET

Sets up the initial blog table in the SQL database.

-----------------------------------------------------------------

'/manageBlog' => GET 

Gets the manageBlog hbs template and displays blog posts authored by the logged in user.

-----------------------------------------------------------------

'/manageBlog' => POST

Updates the edited blog post through the form appended to the selected post. User is taken to the success page "blog-db-done" on completion

post ID is an integer that represents the ID number of the post (read only)

title is a string that represents the title of the blog post

author is a string that represents the author of the blog post (read only)

image is a string that represents the image attached to the blog post, input should represent the image location in the local project files.

link represents the url of a working demo of the blog post (if about a project) Defaulyts to # if left blank

date represents the date object attached to the blog post.

FORMAT (URL ENCODED FORMAT) = "id=11&title=POST+TITLE+CONTENT&image=POST-IMAGE-LOCATION&link=POST-LINK&author=POST-AUTHOR&date=2021-12-02&content=POST+CONTENT+BODY"

-----------------------------------------------------------------

'/newPost' => GET

Serves the user the newPost.hbs page where they can find the form to create a new blog post

-----------------------------------------------------------------

'/newBlogPost' => POST



Adds new blog post data taken from the new post form in newPost.hbs to the blog table. User is taken to blog-db-done.hbs on completion.

author is a string representing the author of the new post (read only)

title is a string representing the title of the new post.

image is a file upload field that stores the image locally in 'public/images/uploads', the name and location of the image is then applied back to req.body.image and passed into the database query for storage.

link is a string representing the link to working project (defaults to '#' if the field is left blank)

date is a selectable date object to represent the date attached to the new blog post.

content is a string that represents the main body of content for the blog post


//needs update
FORMAT (URL ENCODED FORMAT) = "author=POST+AUTHOR&title=POST+TITLE+CONTENT&image=POST-IMAGE-LOCATION&link=POST-LINK&date=2021-12-02&content=POST+CONTENT+BODY"

-----------------------------------------------------------------

'/post-delete' => POST

Deletes the post that the "delete form" is attached to from the blog table, post title and tick box must be checked for delete to happen,
User is taken to blog-db-done.hbs on completion

confirm post title requires user to enter the post title exactly as it appears at the top of the blog post

tick to confirm represents the users confirmation to delete the post. Box must be checked for the delete to work.

FORMAT (URL ENCODED FORMAT) = "deleteThisPost=POST+TITLE+CONTENT"

-----------------------------------------------------------------

'/' => GET

Serves the user the index.hbs file

-----------------------------------------------------------------

'/blog' => GET

Serves the user the blog.hbs file with data from the blog table in the SQL databse, authored by site admin

-----------------------------------------------------------------

'/community-blog' => GET

Serves the user the blog.hbs file with all data from the blog table in the SQL database.

-----------------------------------------------------------------

/blogJson' => GET

Serves the user a replicated copy of the blog page but with data coming from a noSQL JSON database.

-----------------------------------------------------------------


'/blogXml' => GET

Serves the user a replicated copy of the blog page but with data coming from a noSQL XML database.

-----------------------------------------------------------------

'/login' => GET

Serves the user with the login.hbs page

-----------------------------------------------------------------

'/login' => POST

email is a string that represents the users registered email address

password is a string that represents the users registered password

FORMAT (URL ENCODED FORMAT) = "email=USER%40EMAIL.com&password=PASSWORD"

-----------------------------------------------------------------

'/loggedIn' => GET

Serves the user the loggedIn.hbs page to display the users dashboard after successful login.

-----------------------------------------------------------------

'/logOut' => GET 

Serves the user with the index.hbs page after logging the user out.

-----------------------------------------------------------------

'/register' => GET

Serves the user the register.hbs page, where users can register a new account.

-----------------------------------------------------------------

'/register' => POST

email is a string that represents the users email address they are registering with.

username is a string that represents the users display name they wish to register with.

password is a string that represents the desired password they wish to register with.

confirm password is a string that must match the previously entered password as confirmation of correct entry.

register registers the user when fields are filled.

FORMAT (URL ENCODED FORMAT) = "email=USER%40EMAIL.COM&username=USERNAME&password1=PASSWORD&password2=PASSWORD"

-----------------------------------------------------------------