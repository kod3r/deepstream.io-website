/************************************
 * Blog Generator
 ***********************************/
const moment = require( 'moment' );
const hbs = require( 'handlebars' );
const authors = require( '../data/authors.json' );

var checkMeta = function( file ) {
	if( !file.title || !file.dateISO || !file.author || !file.thumbnail ) {
		throw new Error( 'Missing meta data for blog entry (title|dateISO|author|thumbnail) ' + file.filename );
	}

	if( !authors[ file.author] ) {
		throw new Error( 'Author needs to be declared in data/author.json file ' + file.author );
	}
};

var addBlogMeta = function( file ) {
	file.description = file.contents.toString().match( '^[\r\n\S]*([^\n\r]*)')[ 1 ]
	file.blog = {
		date: moment( file.dateISO, 'YYYYMMDD' ).format( 'MMMM Do YYYY' ),
		shortDate: moment( file.dateISO, 'YYYYMMDD' ).format( 'DD/MM/YYYY' ),
		author:  authors[ file.author],
		thumbnail: '/' + file.filename.replace( 'index.md', file.thumbnail ),
		blogPath: '/' + file.filename.replace( 'index.md', '' )
	};
};

var sortBlogs = function( blogPosts ) {
	blogPosts.sort( function( fileA, fileB ) {
		return parseInt( fileA.blog.dateISO ) - parseInt( fileB.blog.dateISO );
	});
	for( var i = 0; i < blogPosts.length; i++ ) {
		blogPosts[ i ].blog.isLatest = i < 4;
	}
};

module.exports = function( metalsmith ) {
	metalsmith.use(function( files, metalsmith, done ) {
		var metadata = metalsmith.metadata();
		metadata.blogPosts = [];

		var fileParts;
		var filePath;
		var file;
		for( filePath in files ) {
			if( filePath.match( 'blog/[^/]+/.*\.md' ) ) {
				file = files[ filePath ];
				checkMeta( file );
				addBlogMeta( file );
				metadata.blogPosts.push( file );
			}
		}
		sortBlogs( metadata.blogPosts );

		return done();
	});
}