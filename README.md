# Bundle Buddy

Bundle buddy helps you to understand what code you are shipping in your javascript bundles.

### Why?

As code splitting becomes more and more common, there is not enough visibility into what is actually ending up in our bundles. This makes it trivial to end up shipping the same exact code in different bundles.

### How to use

#### Detecting duplicated code across bundles:

To detect duplicared code across bundles, bundle buddy uses source maps from each of our chuncks to extract the overlap. Run bundle buddy with a path to each of your source maps to run the analysis.

##### Example run using the attached test data in the project:

`yarn start -- test/create-react-app/*.map`