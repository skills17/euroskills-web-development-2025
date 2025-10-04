# Module A – Static Website Design

In this module, you must develop a static website for a client using HTML and CSS.

Custom Javascript is allowed, but no server-side or client-side framework is allowed for module A.
CSS preprocessors may be used.
All HTML and CSS code, generated or hand-written, must pass the W3C HTML (https://validator.w3.org/) and CSS (https://jigsaw.w3.org/css-validator/) validators.

## Competitor Information

Module A will be assessed using Google Chrome and Firefox.

The axe browser extension installed in Google Chrome is going to be used to assess that the website is "accessibility supported" according to WCAG.

## Website Requirements

The client wants to build a new offshore wind farm.
They have now assigned you the task of implementing the promotion website to promote their new project and find possible investors.

They have provided you with content for the website in the media files directory.
Not all the assets have to be used. You can also create additional assets and text as you see fit.
It's also possible to add links to pages that do not yet exist (for example, a login page).

The website must be responsive and support at least the following viewports:
- Mobile portrait: 320×480 px
- Tablet portrait: 768×1024 px
- Desktop: 1280×800 px

As the website will be publicly available, it is essential to the client that the website conforms to accessibility guidelines (WCAG, at least level AA) and implements SEO best practices.

The following pages must be implemented.

### Home Page

Introduce the project on the home page with the following essentials:
- Embedded visualization video of the offshore wind farm (provided)
  - Autoplay when page is opened without user interaction
  - Video is looped
  - Controls are hidden
  - Takes the full browser width while always maintaining the original aspect ratio
- Brief project overview
- "Key Facts" highlight strip
- Map (provided) showing the proposed offshore wind farm location
- Partner / sponsor logos

The home page must be the index page (index.html).

### Investors Page

Both companies and private individuals should be able to become investors in the project.
It is possible to invest with multiple options:
- Fund one or more wind turbines
  - This allows the investor to provide a short text of at most 25 characters or a company logo that will be engraved on the turbine
- Become a presenting sponsor
  - This allows the investor to provide a logo that will be present on the website and all official communication
- Support the project with a variable amount of money

Those different options have to be displayed on the page.
To be able to show interest in becoming an investor, the page should contain a form to gather contact data (name, email, address, phone number) and it should allow to specify which investment option they choose.
Based on the chosen investment options, the specific fields of that option are presented.

Suitable form field types and validation must be chosen.
Handling of the form submission does not have to be implemented at the moment.

### Visitor Tours Page

Once the wind farm has been built, visitor tours will be provided to explain the technology and to see it in close-up action.
The first few planned tours are already listed on this page with their dates and times, and users should be able to book them.
To book a tour, it's enough to display a "Book now" button next to a tour date. Further functionality does not have to be implemented at the moment.

This page should also contain a map showing the offshore wind farm's planned location and the visitor tour's meeting point.

### Global Elements

The following elements must be visible on all pages:
- **Navigation**
  - must contain links to all three pages
  - design must clearly highlight the current page
  - links must have adequate hover effects
- **Footer**
  - includes at least a copyright notice

All elements can be enriched with more information where it makes sense.
