//using jQuery AJAX
function addNote(){
  var title = document.getElementById("add-title").value;
  var text = document.getElementById("add-body").value;
  var subID = document.getElementById("add-SubID").value;
  var uniID = document.getElementById("add-UniID").value;
  var teachID = document.getElementById("add-TeachID").value;
  var urlID = document.getElementById("add-URL").value;
  var params = "text="+text+"&title="+title+"&subID="+subID+"&uniID="+uniID+"&teachID="+teachID+"&urlID="+urlID;

  $.post("http://localhost:8000/units",params,function(data){
      document.getElementById("notes").innerHTML = "<p class='head'>id</p><p id='id1'>"+data._id+"</p><p class='head'>Title</p><p id='title1'></p><p class='head'>Desciption</p><p id='body1'></p><p class='head'>Subjectid</p><p id='subID1'></p><p class='head'>Unit ID</p><p id='uniID1'></p><p class='head'>Teacher ID</p><p id='teachID1'></p><p class='head'>URL</p><p id='urlID1'></p><button onclick='displayNote()'>display</button><button onclick='editNote()'>Edit</button><button onclick='deleteNote()'>DELETE</button>";
      document.getElementById("add-title").value = "";
      document.getElementById("add-body").value = "";
      document.getElementById("add-SubID").value = "";
      document.getElementById("add-UniID").value = "";
      document.getElementById("add-TeachID").value = "";
      document.getElementById("add-URL").value = "";
    });
    displayNote();
}

function displayNote(){
  var id = document.getElementById ( "id1" ).innerText;

  $.get("http://localhost:8000/units/"+id,function(data) {
      document.getElementById("title1").innerHTML = data.title;
      document.getElementById("body1").innerHTML =  data.text;
      document.getElementById("subID1").innerHTML = data.subID;
      document.getElementById("uniID1").innerHTML = data.uniID;
      document.getElementById("teachID1").innerHTML = data.teachID;
      document.getElementById("urlID1").innerHTML = data.urlID;
    });

}

function editNote(){
  document.getElementById("edit-title").value = document.getElementById("title1").innerHTML;
  document.getElementById("edit-body").value = document.getElementById("body1").innerHTML;
  document.getElementById("edit-subID").value = document.getElementById("subID1").innerHTML;
  document.getElementById("edit-uniID").value = document.getElementById("uniID1").innerHTML;
  document.getElementById("edit-teachID").value = document.getElementById("teachID1").innerHTML;
  document.getElementById("edit-urlID").value = document.getElementById("urlID1").innerHTML;
  document.getElementById('spoiler').style.display = 'block';
}

function saveEdit(){
  var editTitle = document.getElementById("edit-title").value;
  var editText = document.getElementById("edit-body").value;
  var id = document.getElementById ( "id1" ).innerText;

  var params = "text="+editText+"&title="+editTitle;

  $.ajax({url:"http://localhost:8000/units/"+id,contentType:"application/x-www-form-urlencoded",type:"PUT",data:params,success:function(data) {
      document.getElementById("title1").innerHTML = data.title;
      document.getElementById("body1").innerHTML =  data.text;
      document.getElementById('spoiler').style.display = 'none';
    }
});

}

function deleteNote(){
  //console.log("in del");
  var id = document.getElementById ( "id1" ).innerText;

  $.ajax({url:"http://localhost:8000/units/"+id,contentType:"application/x-www-form-urlencoded",type:"DELETE",success:function(data) {
    document.getElementById("id1").innerHTML = "";
    document.getElementById("title1").innerHTML = "";
    document.getElementById("body1").innerHTML =  "";
    document.getElementById("subID1").innerHTML = "";
    document.getElementById("uniID1").innerHTML = "";
    document.getElementById("teachID1").innerHTML =  "";
    document.getElementById("urlID1").innerHTML = "";
  }});

}
