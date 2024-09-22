import React from 'react'

const TestFeld = () => {
    let testObj = {}
    if (testObj.members){console.log('true')}
    for (const x of document.cookie.split(';')){
        const cookieParts = x.split("=")
        testObj[cookieParts[0]] = cookieParts[1]
    }
    const d = new Date();
    d.setTime(d.getTime() + (31*24*60*60*1000));

    for (const x in testObj){
        document.cookie = x+"="+testObj[x]+"; expires="+d.toUTCString()+"; path=/;samesite=strict";
    }
    console.log(document.cookie)
    return (
        <div>testfeld HElllloooo</div>
    )}

export default TestFeld