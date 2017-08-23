//
//  ViewController.swift
//  Mindrop
//
//  Created by Mark Miller on 5/29/17.
//  Copyright © 2017 mdesigns. All rights reserved.
//

import UIKit
import Firebase
import FirebaseDatabase
import WebKit

class LoginViewController: UIViewController, UITextFieldDelegate {
    
    @IBOutlet weak var Email: UITextField!
    
    @IBOutlet weak var Password: UITextField!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.Email.delegate = self
        
        self.Password.delegate = self
    
        textFieldLayout(tf: Email)
        textFieldLayout(tf: Password)
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

    // Layout text field input styles
    func textFieldLayout(tf: UITextField) {
        tf.borderStyle = .none
        tf.layer.backgroundColor = UIColor.white.cgColor
        tf.layer.masksToBounds = false
        tf.layer.shadowColor = UIColor(red: 220/255, green: 220/255, blue: 220/255, alpha: 1).cgColor
        tf.layer.shadowOffset = CGSize(width: 0.0, height: 1.2)
        tf.layer.shadowOpacity = 1.0
        tf.layer.shadowRadius = 0.0
    }
    
    //Hide keyboard when user touches outside keyboard
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        self.view.endEditing(true)
    }
    
    // Hide keyboard when user presses return key
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }
    
    // Login in user, `success` send to correct controller, otherwise show notification
    func login() {
        Auth.auth().signIn(withEmail: Email.text!, password: Password.text!, completion: {
            user, error in
            if error != nil {
                print("Your password or emial is incorrect")
            } else {
                print("It worked your logged int")
            }
        })
    }
}

