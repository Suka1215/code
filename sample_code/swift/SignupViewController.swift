//
//  SignupViewController.swift
//  Mindrop
//
//  Created by Mark Miller on 5/30/17.
//  Copyright © 2017 mdesigns. All rights reserved.
//

import UIKit
import Lottie
import Firebase

class SignupViewController: UIViewController, UITextFieldDelegate {
    
    @IBOutlet weak var usernameField: UITextField!
    @IBOutlet weak var passwordField: UITextField!
    @IBOutlet weak var emailField: UITextField!
    
    var dbRef = Database.database().reference()
    
    let animationView = LOTAnimationView.init(name: "loader")
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.usernameField.delegate = self
        self.emailField.delegate = self
        self.passwordField.delegate = self
        
        textFieldLayout(tf: passwordField)
        textFieldLayout(tf: emailField)
        textFieldLayout(tf: usernameField)
    }
    
    func textFieldDidBeginEditing(_ textField: UITextField) {
        let phColor = UIColor(red: 99/255, green: 86/255, blue: 164/255, alpha: 1)
        textField.layer.shadowColor = UIColor(red: 99/255, green: 86/255, blue: 164/255, alpha: 1).cgColor
        textField.attributedPlaceholder = NSAttributedString(string: textField.placeholder!, attributes: [NSForegroundColorAttributeName: phColor])
    }
    
    func textFieldDidEndEditing(_ textField: UITextField, reason: UITextFieldDidEndEditingReason) {
        let defaultColor = UIColor(red: 220/255, green: 220/255, blue: 220/255, alpha: 1)
        textField.layer.shadowColor = UIColor(red: 220/255, green: 220/255, blue: 220/255, alpha: 1).cgColor
        textField.attributedPlaceholder = NSAttributedString(string: textField.placeholder!, attributes: [NSForegroundColorAttributeName: defaultColor])
    }
    
    // Dismiss keyboard when anywhere outside input is touched
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        self.view.endEditing(true)
    }
    
    // Dismiss keyboard when the return key is pressed
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }
    
    
    // Handle user registration, email verification, set displayName, and create database entry
    @IBAction func handleRegister(_ sender: UIButton) {
        
        startLoadingAnimation()
        
        // Check if fields are completed
        guard let email = emailField.text, let password = passwordField.text, let name = usernameField.text else {
            return
        }
        
        // Create user when the guard expression is met
        Auth.auth().createUser(withEmail: email, password: password) { (user, error) in
            if error != nil {
                print(error!)
                self.stopLoadingAnimation()
                return
            }
            
            // Check if the uid is valid or thou shall not pass
            guard let uid = user?.uid else {
                self.stopLoadingAnimation()
                return
            }
            // Successfully authenticated user
            self.setDisplayName(displayName: name)
            self.sendVerificationEmail(email: email)
            
            // Save user to realtime database
            let usersRef = self.dbRef.child("users").child(uid)
            
            // Set values to store in the database
            let values = ["profile": ["displayName": name, "email": email],
                          "role": ["name": "basic"]]
            
            // Update child reference by saving value to the database under uid
            usersRef.updateChildValues(values, withCompletionBlock: { (error, dbRef) in
                if error != nil {
                    print(error!)
                    self.stopLoadingAnimation()
                    return
                }
                
                // Signout user so they can login in
                do {
                    try Auth.auth().signOut()
                } catch let signOutError as NSError {
                    print("Error signing out: %@", signOutError)
                }
                
                // Navigate to login screen when user successfully creates accout
                let vc = self.storyboard?.instantiateViewController(withIdentifier: "login") as! LoginViewController
                self.present(vc, animated: true, completion: nil)
                // Stop loading when all other actions are finished
                
                self.stopLoadingAnimation()
                
                print("Saved user in firebase db")
            })
        }
    }
    
    // Set user diaplay name base on passed name string
    func setDisplayName(displayName: String) {
        let changeRequest = Auth.auth().currentUser?.createProfileChangeRequest()
        changeRequest?.displayName = displayName
        changeRequest?.commitChanges(completion: { (error) in
            if error != nil {
                print(error!)
                return
            }
        })
    }
    
    // Send email verififcation to the user to be checked when logged in
    func sendVerificationEmail(email: String) {
        Auth.auth().currentUser?.sendEmailVerification(completion: { (error) in
            if error != nil {
                print(error!)
                return
            }
        })
    }
    
    // Start the loading animation when called
    func startLoadingAnimation() {
        animationView?.isHidden = false
        animationView?.frame = CGRect(x: 0, y: 0, width: 175, height: 175)
        animationView?.center = self.view.center
        animationView?.loopAnimation = true
        animationView?.contentMode = .scaleAspectFill
        animationView?.animationSpeed = 2
        
        animationView?.layer.zPosition = 2
        
        self.view.addSubview(animationView!)
        
        animationView?.play()

    }
    
    // Stop the loading animation when called
    func stopLoadingAnimation() {
        animationView?.isHidden = true
    }

    
    // Layout text field input styles
    func textFieldLayout(tf: UITextField) {
        tf.borderStyle = .none
        tf.layer.backgroundColor = UIColor.white.cgColor
        tf.layer.masksToBounds = false
        tf.layer.shadowColor = UIColor.lightGray.cgColor
        tf.layer.shadowOffset = CGSize(width: 0.0, height: 1.2)
        tf.layer.shadowOpacity = 1.0
        tf.layer.shadowRadius = 0.0
        tf.layer.zPosition = 1
    }
}


