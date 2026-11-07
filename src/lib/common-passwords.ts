/**
 * Passwords that are common enough to be guessed first. Compared in lower case, and again after
 * stripping trailing digits and symbols, so "Password123!" is caught as well as "password".
 */
export const COMMON_PASSWORDS: ReadonlySet<string> = new Set([
  "password", "passw0rd", "p@ssw0rd", "p@ssword", "123456", "1234567", "12345678", "123456789", "1234567890",
  "0123456789", "qwerty", "qwertyuiop", "qwerty123", "qazwsx", "qazwsxedc", "asdfgh", "asdfghjkl", "zxcvbnm",
  "abc123", "abcd1234", "abcdef", "abcdefg", "abcdefgh", "iloveyou", "ilovegod", "admin", "administrator",
  "admin123", "root", "toor", "welcome", "welcome1", "login", "letmein", "monkey", "dragon", "master", "shadow",
  "sunshine", "princess", "football", "baseball", "basketball", "soccer", "hockey", "batman", "superman",
  "trustno1", "freedom", "whatever", "hello", "hello123", "helloworld", "secret", "changeme", "default",
  "guest", "test", "test123", "testing", "user", "temp", "temp123", "access", "flower", "hottie", "loveme",
  "lovely", "mustang", "michael", "jennifer", "jordan", "harley", "ranger", "buster", "thomas", "tigger",
  "robert", "soccer1", "starwars", "computer", "internet", "samsung", "google", "facebook", "whatsapp",
  "yahoo", "gmail", "hotmail", "killer", "pepper", "ginger", "summer", "winter", "spring", "autumn",
  "jesus", "jesus1", "godisgood", "blessed", "blessing", "praise", "heaven", "angel", "angels", "family",
  "friends", "forever", "mother", "father", "daddy", "mommy", "sister", "brother", "babygirl", "babyboy",
  "cheese", "chocolate", "cookie", "banana", "orange", "apple", "cherry", "strawberry", "pass", "pass123",
  "pass1234", "password1", "password12", "password123", "password1234", "mypassword", "yourpassword",
  "1q2w3e", "1q2w3e4r", "1qaz2wsx", "q1w2e3r4", "zaq12wsx", "111111", "000000", "121212", "123123", "123321",
  "654321", "666666", "696969", "777777", "888888", "999999", "112233", "123qwe", "qweasd", "qweasdzxc",
  "asdasd", "asdfasdf", "zxczxc", "aaaaaa", "aaaaaaaa", "bbbbbb", "abcabc", "passpass", "pa55word",
  // Swahili and local terms people tend to choose
  "mnyala", "mnyala123", "mnyalaco", "mbono", "mbeya", "mbeya123", "tanzania", "tanzania1", "bongo", "kenya",
  "uganda", "jambo", "karibu", "asante", "habari", "mambo", "poa", "pole", "pole123", "sawa", "simba", "twiga",
  "nakupenda", "mapenzi", "upendo", "amani", "baraka", "mungu", "mungu123", "tumaini", "furaha", "nyumbani",
  "kiswahili", "swahili", "afrika", "africa", "hakunamatata", "mkaa", "mkaa123", "charcoal", "biochar",
  "dodoma", "arusha", "mwanza", "dar", "darsalaam", "zanzibar", "kilimanjaro", "serengeti",
]);
