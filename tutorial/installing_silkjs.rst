.. _installing_silkjs:


*****************
Installing SilkJS
*****************

.. _ubuntu-instructions:

Ubuntu Instructions
===================

Prequisites
-----------

First the essentials::

  sudo apt-get install build-essential subversion git

General purpose libraries::

  sudo apt-get install libmm-dev libssl-dev libgd2-xpm-dev libncurses5-dev libcurl4-openssl-dev libssh2-1-dev libcairo2-dev

Database interface libraries::

  sudo apt-get install libmysqlclient-dev libsqlite3-dev libmemcached-dev

The apache2-util package installs the ab program, which can be used to benchmark SilkJS and other HTTP servers::

  sudo apt-get install apache2-utils

Get SilkJS from GitHub
----------------------

::
	
	mkdir src

::
	
	cd src

::

	git clone https://github.com/mschwartz/SilkJS.git SilkJS

Build and Test
--------------

SilkJS should now build::

  cd SilkJS

::
	
	make

::

	make install

To see it works::

	./silkjs httpd/main.js

=> Point your browser at http://localhost:9090

.. _osx-instructions:

OSX Instructions
================

Install XCode
-------------

Install from the App Store.

Install SubVersion
------------------

Install the command line binary version of SubVersion from this page:
http://www.wandisco.com/subversion/download#osx

*Make sure to edit your ~/.profile to include this line at the end:*

	export PATH=/opt/subversion/bin:$PATH

=> *Close and open your shell window again.*

Install scons
-------------

scons is the only way to build x64 versions of v8. 

Download scons-2.1.0.tar.gz from http://scons.org to your ~/src directory. Then in your shell window::

	tar xzvfp scons-2.1.0.tar.gz

::

	cd scons-2.1.0

::

	sudo python setup.py install

Get SilkJS from GitHub
----------------------

::
	
	mkdir src

::
	
	cd src

::

	git clone https://github.com/mschwartz/SilkJS.git SilkJS

Build and Test
--------------

SilkJS should now build::

  cd SilkJS

::
	
	make

::

	make install

To see it works::

	./silkjs httpd/main.js

=> Point your browser at http://localhost:9090

