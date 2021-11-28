// This takes inspiration from "The 12 Days of Christmas" https://www.youtube.com/watch?v=oyEyMjdD2uk
// and "Old Joe's Place" https://www.youtube.com/watch?v=_JhLuVu-Cho

// Based in large part on the Web scraper in this video (https://www.youtube.com/watch?v=-3lqUHeZs_0)

// The trivia facts come from the FactRepublic web site that seeme to always be in my Pinterest feed

const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const fs = require('fs')
const app = express()
const maxFR = 41849 // As of this writing, this is the highest numbered fact available. I am sure more will come.

let curFact = []


function getFact(i)
{
    return new Promise ((resolve,reject) => {
        // All of the facts have a page that includes the title, a brief description and a link to the source material
        // We scrape those three things out of the page for our song.
        const url = 'https://factrepublic.com/facts/' + i

        axios(url)
            .then(response => {
                const html = response.data
                const $ = cheerio.load(html)

                var theDescription = ""
                var theTitle = ""
                var theSource = ""

                $('.factbox',html).each(function() {
                    theDescription = $(this).find('p').text()
                    theTitle = $(this).find('h1').text()
                    //console.log(theDescription)
                })
                

                $('a', html).each(function() {
                    const rel = $(this).attr('rel')
                    if (rel == 'nofollow'){
                        theSource = $(this).attr('href')
                    }
                })

                curFact = [i,theTitle,theDescription,theSource]
                
            }).catch(err => console.log(err))
            .finally(resolve)
    })

}

async function bard(){
    let song = "Here is my Trivial Facts Song:\n"
    let wordCount = 6 // For the title
    let RANDOM_NUMBER = 0
    let days = 0
    let allFacts = []

    try{

        

        while (wordCount < 50000)
        {
            // This is awkward and could be better
            // My Javascript is rusty. This was a project in part to blow off some dust.
            // while RANDOM_NUMBER is in the AllFacts
            //   Generate new random number in range
            let unique = false
            while (unique == false)
            {
                RANDOM_NUMBER = Math.floor(Math.random() * maxFR) + 1
                unique = true
                allFacts.forEach(fact =>{
                    if(fact[0] == RANDOM_NUMBER)
                    {
                        console.log("Duplicate")
                        unique = false
                    }
                })
            }

            // Call Getfact to get the fact and wait for it.
            // This will fill the temporary object curFact
            // with the object [id,theTitle,theDescription,theSource]
            await getFact(RANDOM_NUMBER)

            // Add "today's" fact to the collection of all facts
            allFacts.push(curFact)

            // Sing about this iterations fact
            song += "The Internet is a magical place in the knowledge space, so what did I learn today?\nDid you know about "
            wordCount += 20
            //Trim ending linefeeds
            curFact[1] = curFact[1].replace(/(\r\n|\n|\r)/gm, "");//remove those line breaks
            song += curFact[1] + "?\n"
            wordCount += curFact[1].match(/(\w+)/g).length;
            song += "It turns out that "
            wordCount += 4
            curFact[2] = curFact[2].replace(/(\r\n|\n|\r)/gm, "");//remove those line breaks
            song += curFact[2] + "\n"
            wordCount += curFact[2].match(/(\w+)/g).length;
            song += "and if you don't believe me go to: " + curFact[3] + "\n\n"
            wordCount += 8

            // Sing the refrain about what I know
            song += "So now I know about:\n"
            wordCount += 4
            allFacts.forEach(fact =>{
                //console.log(`ID [${fact[0]}] Title [${fact[1]}]`)
                song += fact[1] + " and,\n"
                wordCount += 1
                wordCount += fact[1].match(/(\w+)/g).length;
            })
            // remove the last "and,"
            song = song.substring(0,song.length-5)
            song += "\n\n"

            days += 1
            console.log(`Days [${days}] Word count: ${wordCount}`)
        }
    }
    catch(error){console.log(`Error Block => ${error}`)}
    finally{
        console.log("Writing out song")
        fs.writeFile('D:\NaNoGenMo\TriviaSong.txt', song, err => {
            if (err) {
              console.error(err)
              return
            }
            console.log("file written successfully")
          })
    }
}

bard()


