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
		},
		cssmin : {
			target : {
				files : {
					'dist/wvrender.min.css' : [ 'wvrender.css' ]
				}
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );

	grunt.registerTask( 'default', [ 'uglify', 'cssmin' ] );
}