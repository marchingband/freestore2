Freestore is a project to enable anyone, without coding, to build and publish an e-commerce store.
First fork this repo.
Now, looking inside the templates directory, find the template you wish to use, and edit it.
Place a <*> at the top, indicating that this is your chosen template, and fill out the required info.
Upload your photos to the images folder, and copy/paste their names into the template, where you want them placed.
Login to Netlify and create a new deployment from your repository.
Login to Stripe, and determine your API keys. copy/paste them into the environment variables in the Netlify dashboard.
Purchase your domain name through Netlify.
Hit deploy!

Netlify will invoke node and run parseText.js, which will parse the text document, and build store.js in the src directory, which exports all the data for your website. Netlify will then invoke yarn to build the react website, and deploy it.

DEVELOPERS : 
if you would like to build/publish a store of your own design through freestore, please feel free! Pull Requests welcome!!!
you will see that parseStore.js looks for the <*>, and then looks for the appropriate parser for that template. Write a simple parser, and write your React Script, and publish your version of freestore! Power 2 the people!