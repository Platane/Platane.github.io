
For a historian agency based in Luxembourg, my and my team develop a __html5 map editor app__ in the frame of a 6 month large scolar project.

The historic agency comes to us because although they often need to use historical map to illustrate they papers, their process to produce them was long and heavy.

We propose the solution of a web technologies based editor which adopt a __content over presentation__ pattern :

 * The app is linked to a __MongoDB__ powered store which contains map elements as shapes ( country border for example ).

   * The store can be queried to retreive element based on tags, spacial and time localisation.
 
 * The map is displayed using a __Leaflet__ feature to display svg path.

   * Missing elements can be drawn ( basic shape edition , and boolean operation on polygon ) and pushed to the store in order to be re-used later.

   * The map is styled using a __CSS-like__ langage. The editor support hight level feature for writing the MCSS, inspired by the chrome devTool.

   * Finaly, layers can be linked together, to create a convenient captions. The map is ready to be exported


I work with __Lucie Vitale__, __Benoit Godart__, __Kevin Aubert__ . I myself assure most of the development for the editor part. 
I also made the cool poster !
