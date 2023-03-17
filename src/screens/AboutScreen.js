import React from 'react';

const AboutScreen = () => (
	<div className="about">
	  <p>
	    This website provides animated visualizations of some
	    important data structures and algorithms. It is a
	    derivative of an open-source system developed at Georgia
	    Tech, adapted for UIBK needs, adding red-black trees and
	    some minor modifications. The original description
	    follows:
	  </p>
		<p>
			This is a tool to help you visualize and understand the data structures and algorithms
			covered in Georgia Tech's CS 1332 course. It is based on the{' '}
			<a href="https://www.cs.usfca.edu/~galles/visualization/about.html">
				Data Structures Visualizations website
			</a>{' '}
			by David Galles.
		</p>
		<p>
			The CS 1332 Visualization Tool was adapted and expanded by{' '}
			<a href="https://rodrigodlpontes.github.io/website/">Rodrigo Pontes</a>, under the
			supervision of Dr. Mary Hudachek-Buswell, to include data structures and algorithms
			covered in the course. It has since received many additions and revisions from{' '}
			<a href="https://github.com/RodrigoDLPontes/visualization-tool#contributors-">
				many other wonderful contributors
			</a>
			.
		</p>
		<p>
			It also includes icons from{' '}
			<a href="https://material.io/resources/icons/?style=baseline">
				Google&#39;s Material Icons
			</a>
			{' '} and <a href="https://react-icons.github.io/react-icons">react-icons</a>
			, and components from <a href="https://material-ui.com/">Material UI</a>
			{' '} and <a href="https://www.npmjs.com/package/react-hook-theme/v/1.2.5">react-hook-theme</a>.
		</p>
	</div>
);

export default AboutScreen;
