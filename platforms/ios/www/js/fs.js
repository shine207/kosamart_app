
function FS(filename, type, read_type, write_data, cb){
    this.filename = filename;
    this.type = type;
    this.read_type = read_type;
    this.write_data = write_data;
    this.cb = cb;
}

FS.prototype.gotFS= function(fileSystem) {
    if ( this.type == fs.TYPE_READ || this.type == fs.TYPE_REMOVE ) 
        fileSystem.root.getFile(this.filename, null, this.gotFileEntry.bind(this), this.fail.bind(this));
    else 
        fileSystem.root.getFile(this.filename, {create: true, exclusive: false}, this.gotFileEntry.bind(this), this.fail.bind(this));
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
        writer.write(that.write_data);
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
        console.log("Read as data URL");
        console.log(evt.target.result);
        that.cb(null, evt.target.result);
    };
    reader.readAsDataURL(file);
};
FS.prototype.readAsText= function(file) {
    var that = this;
    var reader = new FileReader();
    reader.onloadend = function(evt) {
        console.log("Read as text");
        console.log(evt.target.result);
        that.cb(null, evt.target.result);
    };
    reader.readAsText(file);
};
FS.prototype.fail= function(error) {
    console.log(JSON.stringify(error));
    this.cb(error);
};
FS.prototype.doAction = function() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, this.gotFS.bind(this), this.fail.bind(this));
};

var fs = {
  TYPE_READ:1,
  TYPE_WRITE:2,
  TYPE_REMOVE:3,

  READ_TYPE_URL:1,
  READ_TYPE_TEXT:2,

  readFile: function(filename, read_type, cb) {
    var fs = new FS(filename, this.TYPE_READ, read_type, null, cb);
    fs.doAction();
  },
  writeFile: function(filename, data, cb) {
    var fs = new FS(filename, this.TYPE_WRITE, null, data, cb);
    fs.doAction();
  },
  removeFile: function(filename, cb) {
    var fs = new FS(filename, this.TYPE_REMOVE, null, null, cb);
    fs.doAction();
  }
};

