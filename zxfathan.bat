@echo off
title ZXFATHAN FULL PROJECT

echo ==============================
echo   GENERATE PROJECT ZXFATHAN
echo ==============================

mkdir zxfathan
cd zxfathan

mkdir src
mkdir src\view
mkdir src\main

:: ===== MAIN =====
(
echo package main;
echo import view.LoadingScreen;
echo public class MainApp {
echo     public static void main(String[] args){
echo         new LoadingScreen().setVisible(true);
echo     }
echo }
) > src\main\MainApp.java

:: ===== LOADING =====
(
echo package view;
echo import javax.swing.*;
echo public class LoadingScreen extends JFrame {
echo     public LoadingScreen(){
echo         setTitle("ZXFATHAN SYSTEM");
echo         setSize(400,200);
echo         setLocationRelativeTo(null);
echo         JLabel l=new JLabel("Initializing ZXFATHAN...",SwingConstants.CENTER);
echo         add(l);
echo         new Timer(2000,e->{
echo             new LoginForm().setVisible(true);
echo             dispose();
echo         }).start();
echo     }
echo }
) > src\view\LoadingScreen.java

:: ===== LOGIN =====
(
echo package view;
echo import javax.swing.*;
echo public class LoginForm extends JFrame {
echo     public LoginForm(){
echo         setTitle("ZXFATHAN LOGIN");
echo         setSize(400,300);
echo         setLocationRelativeTo(null);
echo         setDefaultCloseOperation(EXIT_ON_CLOSE);
echo         JPanel p=new JPanel();
echo         JTextField u=new JTextField(15);
echo         JPasswordField ps=new JPasswordField(15);
echo         JButton b=new JButton("LOGIN");
echo         b.addActionListener(e->{
echo             new Dashboard().setVisible(true);
echo             dispose();
echo         });
echo         p.add(new JLabel("Username"));
echo         p.add(u);
echo         p.add(new JLabel("Password"));
echo         p.add(ps);
echo         p.add(b);
echo         add(p);
echo     }
echo }
) > src\view\LoginForm.java

:: ===== DASHBOARD =====
(
echo package view;
echo import javax.swing.*;
echo public class Dashboard extends JFrame {
echo     public Dashboard(){
echo         setTitle("ZXFATHAN DASHBOARD");
echo         setSize(500,300);
echo         setLocationRelativeTo(null);
echo         JPanel p=new JPanel();
echo         JButton k=new JButton("KARYAWAN");
echo         JButton j=new JButton("PEKERJAAN");
echo         k.addActionListener(e-> new FormKaryawan().setVisible(true));
echo         j.addActionListener(e-> new FormPekerjaan().setVisible(true));
echo         p.add(k);
echo         p.add(j);
echo         add(p);
echo     }
echo }
) > src\view\Dashboard.java

:: ===== KARYAWAN =====
(
echo package view;
echo import javax.swing.*;
echo import javax.swing.table.DefaultTableModel;
echo public class FormKaryawan extends JFrame {
echo     DefaultTableModel m;
echo     public FormKaryawan(){
echo         setTitle("DATA KARYAWAN");
echo         setSize(600,400);
echo         setLocationRelativeTo(null);
echo         m=new DefaultTableModel();
echo         m.addColumn("Nama");
echo         m.addColumn("Alamat");
echo         m.addColumn("Jabatan");
echo         JTable t=new JTable(m);
echo         JTextField n=new JTextField(10);
echo         JTextField a=new JTextField(10);
echo         JTextField j=new JTextField(10);
echo         JButton b=new JButton("Tambah");
echo         b.addActionListener(e->{
echo             m.addRow(new Object[]{n.getText(),a.getText(),j.getText()});
echo         });
echo         JPanel p=new JPanel();
echo         p.add(n); p.add(a); p.add(j); p.add(b);
echo         add(p,"North");
echo         add(new JScrollPane(t),"Center");
echo     }
echo }
) > src\view\FormKaryawan.java

:: ===== PEKERJAAN =====
(
echo package view;
echo import javax.swing.*;
echo import javax.swing.table.DefaultTableModel;
echo public class FormPekerjaan extends JFrame {
echo     DefaultTableModel m;
echo     public FormPekerjaan(){
echo         setTitle("DATA PEKERJAAN");
echo         setSize(600,400);
echo         setLocationRelativeTo(null);
echo         m=new DefaultTableModel();
echo         m.addColumn("Nama");
echo         m.addColumn("Gaji");
echo         JTable t=new JTable(m);
echo         JTextField n=new JTextField(10);
echo         JTextField g=new JTextField(10);
echo         JButton b=new JButton("Tambah");
echo         b.addActionListener(e->{
echo             m.addRow(new Object[]{n.getText(),g.getText()});
echo         });
echo         JPanel p=new JPanel();
echo         p.add(n); p.add(g); p.add(b);
echo         add(p,"North");
echo         add(new JScrollPane(t),"Center");
echo     }
echo }
) > src\view\FormPekerjaan.java

echo ==============================
echo   PROJECT BERHASIL DIBUAT!
echo ==============================

pause
