
function FS(filename, type, read_type, write_data, url, cb){
    this.filename = filename;
    this.type = type;
    this.read_type = read_type;
    this.write_data = write_data;
    this.url = url;
    this.cb = cb;
}

FS.prototype.gotFS= function(fileSystem) {
    var rootDirOffset = device.platform.toLowerCase() == "android" ? "Android/data/com.phonegap.kosamart/files" : "";
    fileSystem.root.getDirectory(rootDirOffset, {create:true, exclusive: false}, this.gotDirEntry.bind(this), this.fail.bind(this));
};

FS.prototype.gotDirEntry= function(dirEntry) {
    rootPath = dirEntry.fullPath;
    if ( this.type == fs.TYPE_READ || this.type == fs.TYPE_REMOVE ) 
        dirEntry.getFile(this.filename, null, this.gotFileEntry.bind(this), this.fail.bind(this));
    else if ( this.type == fs.TYPE_WRITE )
        dirEntry.getFile(this.filename, {create: true, exclusive: false}, this.gotFileEntry.bind(this), this.fail.bind(this));
    else if ( this.type == fs.TYPE_UPLOAD ) {
        that = this;
        dirEntry.getFile(that.filename, null, exist, fail);
        function exist(fileEntry) {
            var options = new FileUploadOptions();
            options.fileKey='uploadFile';
            options.fileName=that.filename;
            options.mimeType='text/plain';

            var ft = new FileTransfer();
            ft.upload(rootPath+'/'+that.filename, encodeURI(that.url), success, fail, options);
        }
        function fail(error) {
            if ( error.code == FileError.NOT_FOUND_ERR ) {
                console.log('Update 할 파일이 존재하지 않습니다.');
                that.cb();
            } else {
                console.log('Update 할 파일에 문제가 있습니다.');
                that.cb(error);
            }
        }
        function success(r) {
            if ( r.response == 'success' ) {
                console.log('response : ' + r.response + ', Sent : ' + r.bytesSent);
                that.cb();
            } else {
                that.cb(true);
            }
            fs.removeFile(that.filename, (function() {}));
        }
    } else {
        console.log('TYPE is invalid.. TYPE : '+this.type );
        this.cb(true);
    }
};
FS.prototype.gotFileEntry= function(fileEntry) {
    if ( this.type == fs.TYPE_READ )
        fileEntry.file(this.gotFile.bind(this), this.fail.bind(this));
    else if ( this.type == fs.TYPE_WRITE )
        fileEntry.createWriter(this.gotFileWriter.bind(this), this.fail.bind(this));
    else if ( this.type == fs.TYPE_REMOVE ) 
        fileEntry.remove( (function() { this.cb(); }).bind(this), this.fail.bind(this) );
    else {
        console.log('TYPE is invalid.. TYPE : '+this.type );
        this.cb(true);
    }
};
FS.prototype.gotFileWriter= function(writer) {
    var that = this;
    writer.onwriteend = function(evt) {
        writer.write(JSON.stringify(that.write_data));
        //console.log(that.write_data);
        writer.onwriteend = function(evt) {
            that.cb(null);
        };
    };
    writer.truncate(0);
};
FS.prototype.gotFile= function(file){
    if ( this.read_type == fs.READ_TYPE_URL )
        this.readDataUrl(file);
    else if ( this.read_type == fs.READ_TYPE_TEXT )
        this.readAsText(file);
    else
        this.fail();
};
FS.prototype.readDataUrl= function(file) {
    var that = this;
    var reader = new FileReader();
    reader.onloadend = function(evt) {
        //console.log(evt.target.result);
        that.cb(null, JSON.parse(evt.target.result));
    };
    reader.readAsDataURL(file);
};
FS.prototype.readAsText= function(file) {
    var that = this;
    var reader = new FileReader();
    reader.onloadend = function(evt) {
        //console.log(evt.target.result);
        that.cb(null, JSON.parse(evt.target.result));
    };
    reader.readAsText(file);
};
FS.prototype.fail= function(error) {
    console.log(error);
    this.cb(error);
};
FS.prototype.doAction = function() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, this.gotFS.bind(this), this.fail.bind(this));
};

var fs = {
  TYPE_READ:1,
  TYPE_WRITE:2,
  TYPE_REMOVE:3,
  TYPE_UPLOAD:4,

  READ_TYPE_URL:1,
  READ_TYPE_TEXT:2,

  readFile: function(filename, read_type, cb) {
    var fs = new FS(filename, this.TYPE_READ, read_type, null, null, cb);
    fs.doAction();
  },
  writeFile: function(filename, data, cb) {
    var fs = new FS(filename, this.TYPE_WRITE, null, data, null, cb);
    fs.doAction();
  },
  removeFile: function(filename, cb) {
    var fs = new FS(filename, this.TYPE_REMOVE, null, null, null, cb);
    fs.doAction();
  },
  uploadFile: function(filename, upload_url, cb) {
    var fs = new FS(filename, this.TYPE_UPLOAD, null, null, upload_url, cb);
    fs.doAction();
  }

};
