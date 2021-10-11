fetch("../posts.json")
    .then(response => response.json())
    .then(json => 
        {
            for(let i = 0; i < 6; i++){                
                document.getElementById('projects').innerHTML += 
                    `<div class="project-tile">
                        <a href="" target="_blank">
                            <img alt="Project Thumbnail" src="${json.entries[i].image}"/>
                            <p>"${json.entries[i].title}"</p>
                        </a>  
                    </div>`
            }
        }        
);