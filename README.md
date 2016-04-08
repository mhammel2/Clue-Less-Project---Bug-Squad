# Infinite Pirate Runner

Infinite runner game (pirate themed!) made at the Baltimore Hackathon in 2015.

## Installation

Install node.js

Run the followng commands using npm:
* npm install phaser
* npm install express --save
* npm install socket.io

On Windows, you may have trouble using npm to install socket.io (may be fixed sometime soon) with nodejs 4.0.0. 
As a temporary workaround, do the following:

Depending on the date, a simple:

* npm uninstall socket.io
* npm install socket.io 

may fix your issue - if the change to socket.io has been published to npm. If not, do the following:

* Go to C:\Users\%YOUR USERNAME%\node_modules\socket.io\package.json
* Change the engine.io dependency from 1.5.2 to automattic/engine.io#7e77dd5
* After that edit, cd into your node_modules\socket.io directory, and run npm install --production

[Click here to read more.](https://github.com/socketio/socket.io/issues/2213#issuecomment-139543606)

## Usage

cd into the downloaded repo and run:

* node app.js
* navigate to http://localhost:8080 in your browser

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Credits

Written by David Kramer and Matthew Hammel in one weekend.

## License

The MIT License (MIT)

Copyright (c) <2015> <David Kramer, Matthew Hammel>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
