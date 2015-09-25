# framework_for_postman


This hack/add-on to Postman can be use for better automatic testing, repetition of tests cases and better logging.

This was build on the side as a hobby, and I can offer best-effort support only.

When you launch Postman, or any Runner window, another reporting window should pop up.

You can now use a few methods to define sequence of tests cases, and to repeat the whole thing.

For example : 


```javascript
TC-1 
    Sequence-1 :
                       Pre-request script :
                                  //All my invalid characters for testing, in an array
                                  repetition_data_array = FRAMEWORK.INVALID_CHARACTERS.split(''); 
                                  FRAMEWORK.repeatTC_for(repetition_data_array);
                                  FRAMEWORK.test_init("TC-1","Test case name",['testcategories#1']);
                                  FRAMEWORK.sequence_init("Part1 - Create");
                       Tests :
                                  FRAMEWORK.sequence_end(tests);
      Sequence-2 :
                       Pre-request script  
                                  FRAMEWORK.sequence_init("Part2 - Modify");
                       Tests :
                                  FRAMEWORK.sequence_end(tests);
      Sequence-3 :
                       Pre-request script  
                                  FRAMEWORK.sequence_init("Part3 - Validation");
                       Tests :
                                  FRAMEWORK.sequence_end(tests);
                                  FRAMEWORK.test_exit();
TC-2
```



***Every tests cases should have it's subfolder in a collection, and every sequence is a test under that folder.
```javascript
Collection/
      TestCase-TC1/
               sequence #1
               sequence #2
```


Prerequesities :
    Postman with license Jetpack addon
    Tested with Postman 3.04 & 3.12 under Chrome  40.0.2214.115
