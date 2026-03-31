import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Language = { #bengali; #english };
  type Difficulty = { #easy; #medium; #hard };

  public type Question = {
    id : Nat; category : Text; language : Language;
    questionText : Text; options : [Text]; correctIndex : Nat; difficulty : Difficulty;
  };
  public type ScoreEntry = {
    id : Nat; playerName : Text; score : Nat; totalQuestions : Nat;
    category : Text; language : Language; timestamp : Int;
  };
  public type UserProfile = { name : Text };
  public type Transaction = {
    id : Nat; user : Principal; amount : Int; description : Text; timestamp : Int;
  };
  public type UserSummary = { principal : Principal; profile : ?UserProfile; balance : Nat };
  public type UserAccount = { username : Text; password : Text; createdAt : Int };
  public type Notice = { id : Nat; title : Text; content : Text; isActive : Bool; createdAt : Int };
  public type Post = { id : Nat; title : Text; content : Text; imageUrl : Text; createdAt : Int };
  public type RegisterResult = { #ok; #usernameExists; #invalidInput };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let questions = Map.empty<Nat, Question>();
  let scoreEntries = Map.empty<Nat, ScoreEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let walletBalances = Map.empty<Principal, Nat>();
  let transactions = Map.empty<Nat, Transaction>();
  let userAccounts = Map.empty<Text, UserAccount>();
  let notices = Map.empty<Nat, Notice>();
  let posts = Map.empty<Nat, Post>();

  var nextQuestionId = 1;
  var nextScoreId = 1;
  var nextTxId = 1;
  var nextNoticeId = 1;
  var nextPostId = 1;

  let adminPassword = "admin123";

  // --- User Accounts ---
  public func registerUser(username : Text, password : Text) : async RegisterResult {
    if (username.size() < 3 or password.size() < 4) { return #invalidInput };
    switch (userAccounts.get(username)) {
      case (?_) { return #usernameExists };
      case null {
        userAccounts.add(username, { username; password; createdAt = Time.now() });
        return #ok;
      };
    };
  };

  public query func loginUser(username : Text, password : Text) : async Bool {
    switch (userAccounts.get(username)) {
      case (?account) { Text.equal(account.password, password) };
      case null { false };
    };
  };

  public query func getAllUserAccounts(adminPwd : Text) : async [UserAccount] {
    if (not Text.equal(adminPwd, adminPassword)) { Runtime.trap("Unauthorized") };
    userAccounts.values().toArray();
  };

  // --- Notices ---
  public query func getActiveNotices() : async [Notice] {
    notices.values().toArray().filter(func(n : Notice) : Bool { n.isActive });
  };

  public query func getAllNotices(adminPwd : Text) : async [Notice] {
    if (not Text.equal(adminPwd, adminPassword)) { Runtime.trap("Unauthorized") };
    notices.values().toArray();
  };

  public func addNotice(adminPwd : Text, title : Text, content : Text) : async Nat {
    if (not Text.equal(adminPwd, adminPassword)) { Runtime.trap("Unauthorized") };
    let id = nextNoticeId;
    notices.add(id, { id; title; content; isActive = true; createdAt = Time.now() });
    nextNoticeId += 1;
    id;
  };

  public func updateNotice(adminPwd : Text, id : Nat, title : Text, content : Text, isActive : Bool) : async () {
    if (not Text.equal(adminPwd, adminPassword)) { Runtime.trap("Unauthorized") };
    switch (notices.get(id)) {
      case null { Runtime.trap("Not found") };
      case (?n) { notices.add(id, { id = n.id; title; content; isActive; createdAt = n.createdAt }) };
    };
  };

  public func deleteNotice(adminPwd : Text, id : Nat) : async () {
    if (not Text.equal(adminPwd, adminPassword)) { Runtime.trap("Unauthorized") };
    notices.remove(id);
  };

  // --- Posts ---
  public query func getActivePosts() : async [Post] {
    let all = posts.values().toArray();
    all.sort(func(a : Post, b : Post) : { #less; #equal; #greater } { Int.compare(b.createdAt, a.createdAt) });
  };

  public query func getAllPosts(adminPwd : Text) : async [Post] {
    if (not Text.equal(adminPwd, adminPassword)) { Runtime.trap("Unauthorized") };
    let all = posts.values().toArray();
    all.sort(func(a : Post, b : Post) : { #less; #equal; #greater } { Int.compare(b.createdAt, a.createdAt) });
  };

  public func addPost(adminPwd : Text, title : Text, content : Text, imageUrl : Text) : async Nat {
    if (not Text.equal(adminPwd, adminPassword)) { Runtime.trap("Unauthorized") };
    let id = nextPostId;
    posts.add(id, { id; title; content; imageUrl; createdAt = Time.now() });
    nextPostId += 1;
    id;
  };

  public func updatePost(adminPwd : Text, id : Nat, title : Text, content : Text, imageUrl : Text) : async () {
    if (not Text.equal(adminPwd, adminPassword)) { Runtime.trap("Unauthorized") };
    switch (posts.get(id)) {
      case null { Runtime.trap("Not found") };
      case (?p) { posts.add(id, { id = p.id; title; content; imageUrl; createdAt = p.createdAt }) };
    };
  };

  public func deletePost(adminPwd : Text, id : Nat) : async () {
    if (not Text.equal(adminPwd, adminPassword)) { Runtime.trap("Unauthorized") };
    posts.remove(id);
  };

  // --- User Profile ---
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    userProfiles.add(caller, profile);
  };

  // --- Wallet ---
  public query ({ caller }) func getMyBalance() : async Nat {
    switch (walletBalances.get(caller)) { case (?b) b; case null 0 };
  };

  public query ({ caller }) func getMyTransactions() : async [Transaction] {
    transactions.values().toArray().filter(func(tx : Transaction) : Bool { tx.user == caller });
  };

  public shared ({ caller }) func creditWallet(amount : Nat, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized: must be logged in") };
    let current = switch (walletBalances.get(caller)) { case (?b) b; case null 0 };
    walletBalances.add(caller, current + amount);
    transactions.add(nextTxId, { id = nextTxId; user = caller; amount = Int.fromNat(amount); description; timestamp = Time.now() });
    nextTxId += 1;
  };

  public shared ({ caller }) func debitWallet(amount : Nat, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    let current = switch (walletBalances.get(caller)) { case (?b) b; case null 0 };
    if (current < amount) { Runtime.trap("Insufficient balance") };
    walletBalances.add(caller, current - amount);
    transactions.add(nextTxId, { id = nextTxId; user = caller; amount = -Int.fromNat(amount); description; timestamp = Time.now() });
    nextTxId += 1;
  };

  public shared ({ caller }) func adminAdjustBalance(user : Principal, amount : Int, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized: admin only") };
    let current = switch (walletBalances.get(user)) { case (?b) b; case null 0 };
    let newBalance = Int.fromNat(current) + amount;
    if (newBalance < 0) { Runtime.trap("Cannot set negative balance") };
    walletBalances.add(user, newBalance.toNat());
    transactions.add(nextTxId, { id = nextTxId; user; amount; description; timestamp = Time.now() });
    nextTxId += 1;
  };

  // --- Admin ---
  public query func verifyAdminPassword(password : Text) : async Bool {
    Text.equal(password, adminPassword);
  };

  public query ({ caller }) func getAllUsers() : async [UserSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized") };
    userProfiles.keys().toArray().map(func(p : Principal) : UserSummary {
      { principal = p; profile = userProfiles.get(p); balance = switch (walletBalances.get(p)) { case (?b) b; case null 0 } }
    });
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized") };
    transactions.values().toArray();
  };

  // --- Questions ---
  public shared ({ caller }) func addQuestion(question : Question) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized") };
    let q = { question with id = nextQuestionId };
    questions.add(nextQuestionId, q);
    nextQuestionId += 1;
    q.id;
  };

  public shared ({ caller }) func updateQuestion(id : Nat, question : Question) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized") };
    switch (questions.get(id)) {
      case null { Runtime.trap("Not found") };
      case (_) { questions.add(id, question) };
    };
  };

  public shared ({ caller }) func deleteQuestion(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized") };
    questions.remove(id);
  };

  public query func getAllQuestions() : async [Question] { questions.values().toArray() };

  public query func getQuestionsByCategory(category : Text) : async [Question] {
    questions.values().toArray().filter(func(q : Question) : Bool { Text.equal(q.category, category) });
  };

  public query func getQuestionsByLanguage(language : Language) : async [Question] {
    questions.values().toArray().filter(func(q : Question) : Bool { q.language == language });
  };

  public query func getQuestionsByCategoryAndLanguage(category : Text, language : Language) : async [Question] {
    questions.values().toArray().filter(func(q : Question) : Bool { Text.equal(q.category, category) and q.language == language });
  };

  // --- Scores ---
  public shared ({ caller }) func submitScore(entry : ScoreEntry) : async ScoreEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    let newEntry = { entry with id = nextScoreId; timestamp = Time.now() };
    scoreEntries.add(nextScoreId, newEntry);
    nextScoreId += 1;
    newEntry;
  };

  public query func getLeaderboard() : async [ScoreEntry] {
    let all = scoreEntries.values().toArray();
    let sorted = all.sort(func(a : ScoreEntry, b : ScoreEntry) : { #less; #equal; #greater } { Nat.compare(b.score, a.score) });
    if (sorted.size() <= 20) sorted else sorted.sliceToArray(0, 20);
  };

  public query func getLeaderboardByCategory(category : Text) : async [ScoreEntry] {
    let filtered = scoreEntries.values().toArray().filter(func(s : ScoreEntry) : Bool { Text.equal(s.category, category) });
    let sorted = filtered.sort(func(a : ScoreEntry, b : ScoreEntry) : { #less; #equal; #greater } { Nat.compare(b.score, a.score) });
    if (sorted.size() <= 10) sorted else sorted.sliceToArray(0, 10);
  };

  // --- Initialization ---
  public shared ({ caller }) func initializeData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) { Runtime.trap("Unauthorized") };
    if (questions.size() > 0) { return };
    let sampleQ : [(Text, Language, Text, [Text], Nat, Difficulty)] = [
      ("General Knowledge", #bengali, "Bangladesh capital?", ["Chittagong", "Dhaka", "Rajshahi", "Sylhet"], 1, #easy),
      ("Science", #bengali, "Water formula?", ["CO2", "H2O", "O2", "NaCl"], 1, #easy),
      ("General Knowledge", #english, "Capital of France?", ["London", "Berlin", "Paris", "Madrid"], 2, #easy),
      ("Science", #english, "Speed of light?", ["200,000 km/s", "300,000 km/s", "400,000 km/s", "150,000 km/s"], 1, #easy),
    ];
    for ((cat, lang, text, opts, ci, diff) in sampleQ.vals()) {
      questions.add(nextQuestionId, { id = nextQuestionId; category = cat; language = lang; questionText = text; options = opts; correctIndex = ci; difficulty = diff });
      nextQuestionId += 1;
    };
  };
};
