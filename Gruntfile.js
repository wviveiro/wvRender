module.exports = function( grunt ){

	grunt.initConfig( {
		uglify: {
			options: {
				mangle : false
			},
			wvrender : {
				files : {
					'dist/wvrender.min.js' : [ 'wvrender.js' ]
				}
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-uglify' );

	grunt.registerTask( 'default', [ 'uglify' ] );
}